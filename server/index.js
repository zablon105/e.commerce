const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'data.json');
let db = { products: [], feedback: [] };

async function loadData(){
  try{
    const text = await fs.readFile(DATA_FILE, 'utf8');
    db = JSON.parse(text || '{}');
    db.products = db.products || [];
    db.feedback = db.feedback || [];
  }catch(e){
    db = { products: [], feedback: [] };
    await saveData();
  }
}

async function saveData(){
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const OWNER_PASS = process.env.OWNER_PASSCODE || 'owner123';

function requireAuth(req, res, next){
  const pass = req.headers['x-owner-passcode'];
  if(!pass || pass !== OWNER_PASS){
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/api/products', async (req, res) => {
  await loadData();
  res.json(db.products);
});

app.post('/api/products', requireAuth, async (req, res) => {
  const { name, price, gender = 'female', category = 'other', image = '' } = req.body;
  if(!name || typeof price !== 'number') return res.status(400).json({ error: 'name and numeric price required' });
  const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${Date.now()}`;
  const product = { id, name, price, gender, category, image };
  await loadData();
  db.products.push(product);
  await saveData();
  res.status(201).json(product);
});

app.put('/api/products/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  await loadData();
  const idx = db.products.findIndex(p => p.id === id);
  if(idx === -1) return res.status(404).json({ error: 'not found' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  await saveData();
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  await loadData();
  const before = db.products.length;
  db.products = db.products.filter(p => p.id !== id);
  await saveData();
  res.json({ deleted: before - db.products.length });
});

// feedback endpoints
app.get('/api/feedback', async (req, res) => { await loadData(); res.json(db.feedback); });
app.post('/api/feedback', async (req, res) => {
  const { message } = req.body;
  if(!message) return res.status(400).json({ error: 'message required' });
  await loadData();
  const entry = { id: `f-${Date.now()}`, message, submittedAt: new Date().toISOString() };
  db.feedback.push(entry);
  await saveData();
  res.status(201).json(entry);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
