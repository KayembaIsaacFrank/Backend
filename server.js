
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Parser } = require('json2csv');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'goldencrop_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function query(sql, params){ const [rows] = await pool.execute(sql, params||[]); return rows; }

app.get('/', (req,res)=>res.json({message:'Golden Crop API'}));

app.post('/api/auth/register', async (req,res)=>{
  try{
    const {name,email,password,role} = req.body;
    if(!name||!email||!password) return res.status(400).json({error:'Missing fields'});
    const existing = await query('SELECT * FROM users WHERE email=?',[email]);
    if(existing.length) return res.status(400).json({error:'User exists'});
    const hash = await bcrypt.hash(password,10);
    await query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',[name,email,hash,role||'agent']);
    res.json({message:'User registered'});
  }catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

app.post('/api/auth/login', async (req,res)=>{
  try{
    const {email,password} = req.body;
    const rows = await query('SELECT * FROM users WHERE email=?',[email]);
    if(!rows.length) return res.status(400).json({error:'Invalid credentials'});
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(400).json({error:'Invalid credentials'});
    req.session.user = { user_id: user.user_id, name: user.name, role: user.role };
    res.json({message:'Logged in', user:req.session.user});
  }catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

function requireAuth(req,res,next){ if(!req.session.user) return res.status(401).json({error:'Unauthorized'}); next(); }

app.post('/api/procurement', requireAuth, async (req,res)=>{
  try{
    const {produce_name,tonnage,cost} = req.body;
    if(!produce_name||!tonnage) return res.status(400).json({error:'Missing fields'});
    let prod = await query('SELECT * FROM produce WHERE name=?',[produce_name]);
    let pid;
    if(prod.length) pid = prod[0].produce_id;
    else { await query('INSERT INTO produce (name) VALUES (?)',[produce_name]); const last = await query('SELECT LAST_INSERT_ID() as id'); pid = last[0].id; }
    await query('INSERT INTO procurement (produce_id, tonnage, cost, recorded_by, date_time) VALUES (?,?,?,?,NOW())',[pid,tonnage,cost,req.session.user.user_id]);
    const stock = await query('SELECT * FROM stock WHERE produce_id=?',[pid]);
    if(!stock.length) await query('INSERT INTO stock (produce_id,current_balance,last_updated) VALUES (?,?,NOW())',[pid,tonnage]);
    else await query('UPDATE stock SET current_balance=current_balance+?, last_updated=NOW() WHERE produce_id=?',[tonnage,pid]);
    res.json({message:'Procurement recorded'});
  }catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

app.post('/api/sales', requireAuth, async (req,res)=>{
  try{
    const {produce_name,tonnage,amount_paid} = req.body;
    if(!produce_name||!tonnage) return res.status(400).json({error:'Missing fields'});
    let prod = await query('SELECT * FROM produce WHERE name=?',[produce_name]);
    if(!prod.length) return res.status(400).json({error:'Produce not found'});
    const pid = prod[0].produce_id;
    const stock = await query('SELECT * FROM stock WHERE produce_id=?',[pid]);
    if(!stock.length || stock[0].current_balance < tonnage) return res.status(400).json({error:'Insufficient stock'});
    await query('INSERT INTO sales (produce_id, tonnage, amount_paid, sales_agent_id, date_time) VALUES (?,?,?,?,NOW())',[pid,tonnage,amount_paid,req.session.user.user_id]);
    await query('UPDATE stock SET current_balance=current_balance-?, last_updated=NOW() WHERE produce_id=?',[tonnage,pid]);
    res.json({message:'Sale recorded'});
  }catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

app.get('/api/stock', requireAuth, async (req,res)=>{
  try{
    const rows = await query('SELECT s.stock_id, p.name AS produce_name, s.current_balance, s.last_updated FROM stock s JOIN produce p ON s.produce_id=p.produce_id');
    res.json({stock:rows});
  }catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

app.get('/api/reports/sales-by-produce', requireAuth, async (req,res)=>{
  try{
    const rows = await query(`SELECT p.name AS produce_name, SUM(s.tonnage) AS total_tonnage, SUM(s.amount_paid) AS total_amount FROM sales s JOIN produce p ON s.produce_id=p.produce_id GROUP BY p.name`);
    res.json({data:rows});
  }catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

app.get('/api/reports/sales-by-produce/csv', requireAuth, async (req,res)=>{
  try{
    const rows = await query(`SELECT p.name AS produce_name, SUM(s.tonnage) AS total_tonnage, SUM(s.amount_paid) AS total_amount FROM sales s JOIN produce p ON s.produce_id=p.produce_id GROUP BY p.name`);
    const fields = ['produce_name','total_tonnage','total_amount'];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);
    res.header('Content-Type','text/csv');
    res.attachment('sales_by_produce.csv');
    res.send(csv);
  }catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

app.listen(process.env.PORT||5000, ()=> console.log('Server running on port', process.env.PORT||5000));
