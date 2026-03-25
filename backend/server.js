const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Create database - this will create the file if it doesn't exist
const db = new Database('./database.db');

// Business Profile
const BUSINESS_PROFILE = {
    name: 'Grime Guys',
    owner: 'Landon Duvall',
    phone: '(864) 704-6341',
    email: 'grimeguyswork@gmail.com',
    serviceArea: 'Simpsonville, Fountain Inn, and surrounding areas',
    tagline: 'Clean Yards. Clean Surfaces. Done Right.',
    description: 'Grime Guys is a teen-owned business focused on providing high-quality pressure washing and lawn care services.'
};

// Predefined services
const SERVICES = [
    { id: 'mowing', name: 'Mowing', description: 'Edging, trimming, weed-eating, bagging' },
    { id: 'pressure_washing', name: 'Pressure Washing', description: 'Driveways, sidewalks, patios, decks' },
    { id: 'leaf_blowing', name: 'Leaf Blowing', description: 'Clearing debris, leaves, grass clippings' },
    { id: 'bush_trimming', name: 'Bush Trimming', description: 'Shaping, trimming, pruning' },
    { id: 'trailer_rental', name: 'Trailer Rental (4x6)', description: 'Small trailer rental for hauling' }
];

// Create all tables using exec() for multiple statements
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT,
        client_email TEXT,
        client_phone TEXT,
        address TEXT,
        service_type TEXT,
        service_date TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT,
        client_email TEXT,
        client_phone TEXT,
        service_type TEXT,
        price REAL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        amount REAL,
        description TEXT,
        date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT,
        quantity INTEGER,
        unit TEXT,
        reorder_level INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        image_data TEXT,
        description TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        invoice_number TEXT,
        amount REAL,
        status TEXT DEFAULT 'unpaid',
        due_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS social_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT,
        content TEXT,
        scheduled_date TEXT,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

console.log('✅ Database tables created');

// API Routes

// Users
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
        const result = stmt.run(email, password);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?');
        const user = stmt.get(email, password);
        if (user) {
            res.json({ success: true, user: { id: user.id, email: user.email } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Jobs
app.get('/api/jobs', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC');
        const jobs = stmt.all();
        res.json(jobs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/jobs', (req, res) => {
    const { client_name, client_email, client_phone, address, service_type, service_date, notes } = req.body;
    try {
        const stmt = db.prepare(`INSERT INTO jobs (client_name, client_email, client_phone, address, service_type, service_date, notes) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`);
        const result = stmt.run(client_name, client_email, client_phone, address, service_type, service_date, notes);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/jobs/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const stmt = db.prepare('UPDATE jobs SET status = ? WHERE id = ?');
        stmt.run(status, id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Quotes
app.get('/api/quotes', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC');
        const quotes = stmt.all();
        res.json(quotes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/quotes', (req, res) => {
    const { client_name, client_email, client_phone, service_type, price, description } = req.body;
    try {
        const stmt = db.prepare(`INSERT INTO quotes (client_name, client_email, client_phone, service_type, price, description) 
                                 VALUES (?, ?, ?, ?, ?, ?)`);
        const result = stmt.run(client_name, client_email, client_phone, service_type, price, description);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Clients
app.get('/api/clients', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM clients ORDER BY created_at DESC');
        const clients = stmt.all();
        res.json(clients);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/clients', (req, res) => {
    const { name, email, phone, address, notes } = req.body;
    try {
        const stmt = db.prepare(`INSERT INTO clients (name, email, phone, address, notes) VALUES (?, ?, ?, ?, ?)`);
        const result = stmt.run(name, email, phone, address, notes);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Expenses
app.get('/api/expenses', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM expenses ORDER BY date DESC');
        const expenses = stmt.all();
        res.json(expenses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/expenses', (req, res) => {
    const { category, amount, description, date } = req.body;
    try {
        const stmt = db.prepare(`INSERT INTO expenses (category, amount, description, date) VALUES (?, ?, ?, ?)`);
        const result = stmt.run(category, amount, description, date);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Inventory
app.get('/api/inventory', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM inventory ORDER BY item_name');
        const inventory = stmt.all();
        res.json(inventory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/inventory', (req, res) => {
    const { item_name, quantity, unit, reorder_level, notes } = req.body;
    try {
        const stmt = db.prepare(`INSERT INTO inventory (item_name, quantity, unit, reorder_level, notes) 
                                 VALUES (?, ?, ?, ?, ?)`);
        const result = stmt.run(item_name, quantity, unit, reorder_level, notes);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Photos
app.get('/api/photos', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM photos ORDER BY uploaded_at DESC');
        const photos = stmt.all();
        res.json(photos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/photos', (req, res) => {
    const { job_id, image_data, description } = req.body;
    try {
        const stmt = db.prepare(`INSERT INTO photos (job_id, image_data, description) VALUES (?, ?, ?)`);
        const result = stmt.run(job_id, image_data, description);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Invoices
app.get('/api/invoices', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC');
        const invoices = stmt.all();
        res.json(invoices);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/invoices', (req, res) => {
    const { job_id, invoice_number, amount, due_date } = req.body;
    try {
        const stmt = db.prepare(`INSERT INTO invoices (job_id, invoice_number, amount, due_date) VALUES (?, ?, ?, ?)`);
        const result = stmt.run(job_id, invoice_number, amount, due_date);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Social Posts
app.get('/api/social', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM social_posts ORDER BY scheduled_date DESC');
        const posts = stmt.all();
        res.json(posts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/social', (req, res) => {
    const { platform, content, scheduled_date } = req.body;
    try {
        const stmt = db.prepare(`INSERT INTO social_posts (platform, content, scheduled_date) VALUES (?, ?, ?)`);
        const result = stmt.run(platform, content, scheduled_date);
        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Business profile
app.get('/api/profile', (req, res) => {
    res.json(BUSINESS_PROFILE);
});

// Services
app.get('/api/services', (req, res) => {
    res.json(SERVICES);
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Grime Guys Server running on http://localhost:${PORT}`);
    console.log(`📊 All features loaded: Inventory, Photos, Invoices, Costing, Social`);
});
EOF
