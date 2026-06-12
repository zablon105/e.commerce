const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function run(){
  const file = path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom;

  // load axe-core into the JSDOM window
  const axeSource = fs.readFileSync(require.resolve('axe-core'), 'utf8');
  window.eval(axeSource);

  // Wait a tick for resources
  await new Promise(r => setTimeout(r, 50));

  try{
    const results = await window.axe.run(window.document);
    console.log(JSON.stringify(results, null, 2));
  }catch(err){
    console.error('Axe run failed:', err);
    process.exit(2);
  }
}

run();
