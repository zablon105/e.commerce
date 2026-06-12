const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const axe = require('axe-core');

(async () => {
  const outPath = path.resolve(__dirname, 'axe_browser_results.json');
  const target = process.env.TARGET_URL || 'http://localhost:3000';
  const indexFile = path.resolve(__dirname, '..', 'index.html');
  let browser;

  try {
    // Try to find a local Chrome/Chromium executable to avoid downloading Chromium during install
    const chromeCandidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Chromium\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Chromium\\Application\\chrome.exe'
    ];
    const fs = require('fs');
    const found = chromeCandidates.find(p => fs.existsSync(p));
    const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    if (found) launchOptions.executablePath = found;
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    // Try loading the running server first, fall back to file://
    try {
      const resp = await page.goto(target, { waitUntil: 'networkidle2' });
      if (!resp || !resp.ok()) throw new Error('Server not available');
    } catch (e) {
      console.warn('Navigation to target server failed:', e.message);
      await page.goto('file://' + indexFile, { waitUntil: 'load' });
    }

    const axeSource = axe.source;
    const results = await page.evaluate(async (src) => {
      eval(src);
      return await axe.run(document);
    }, axeSource);

    fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
    console.log('Saved axe results to', outPath);
    console.log('violations:', results.violations.length, 'incomplete:', results.incomplete.length, 'passes:', results.passes.length);

    await browser.close();
  } catch (err) {
    if (browser) await browser.close();
    console.error('Error running browser audit:', err);
    process.exit(1);
  }
})();
