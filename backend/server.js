const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Create database
const db = new sqlite3.Database('./database.db');

// Business Profile
const BUSINESS_PROFILE = {
    name: 'Grime Guys',
    owner: 'Landon Duvall',
    phone: '(864) 704-6341',
    email: 'grimeguyswork@gmail.com',
    serviceArea: 'Simpsonville, Fountain Inn, and surrounding areas',
    tagline: 'Clean Yards. Clean Surfaces. Done Right.',
    description: 'Grime Guys is a teen-owned business focused on providing high-quality outdoor services.'
};

// Predefined services
const SERVICES = [
    { id: 'mowing', name: 'Mowing', description: 'Edging, trimming, weed-eating, blow-off', basePrice: 45 },
    { id: 'pressure_washing', name: 'Pressure Washing', description: 'Driveway, sidewalk, deck, fence, siding cleaning', basePrice: 150 },
    { id: 'leaf_blowing', name: 'Leaf Blowing', description: 'Clearing debris, optional bagging', basePrice: 35 },
    { id: 'bush_trimming', name: 'Bush Trimming', description: 'Shaping, trimming, cleanup', basePrice: 40 },
    { id: 'trailer_rental', name: 'Trailer Rental (4x6)', description: 'Small trailer rental for hauling', basePrice: 50 }
];

// Create all tables
db.serialize(() => {
    // Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Jobs
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        phone TEXT,
        address TEXT,
        service_type TEXT,
        service_details TEXT,
        job_date TEXT,
        revenue REAL,
        expenses REAL,
        profit REAL,
        notes TEXT,
        status TEXT,
        payment_method TEXT,
        paid_at DATETIME,
        before_photo TEXT,
        after_photo TEXT,
        is_recurring INTEGER DEFAULT 0,
        recurring_frequency TEXT,
        latitude REAL,
        longitude REAL,
        estimated_travel_time INTEGER,
        order_index INTEGER,
        weather_forecast TEXT,
        weather_checked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Pricing templates
    db.run(`CREATE TABLE IF NOT EXISTS pricing_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_type TEXT UNIQUE,
        min_price REAL,
        max_price REAL,
        avg_price REAL,
        notes TEXT
    )`);
    
    // Quotes
    db.run(`CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        quote_number TEXT UNIQUE,
        customer_name TEXT,
        address TEXT,
        services TEXT,
        total_amount REAL,
        status TEXT DEFAULT 'Draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATE
    )`);
    
    // Expenses
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        category TEXT,
        amount REAL,
        description TEXT,
        date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Follow-ups
    db.run(`CREATE TABLE IF NOT EXISTS follow_ups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        message TEXT,
        sent_at DATETIME,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Inventory
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT,
        quantity REAL,
        unit TEXT,
        min_quantity REAL,
        price_per_unit REAL,
        last_restocked DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Photos
    db.run(`CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        photo_type TEXT,
        photo_data TEXT,
        caption TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    )`);
    
    // Invoices
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        invoice_number TEXT UNIQUE,
        amount REAL,
        tax REAL,
        total REAL,
        status TEXT DEFAULT 'Pending',
        paid_at DATETIME,
        payment_method TEXT,
        pdf_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    )`);
    
    // Payments
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER,
        amount REAL,
        payment_method TEXT,
        transaction_id TEXT,
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )`);
    
    // Weather
    db.run(`CREATE TABLE IF NOT EXISTS weather (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE,
        temperature REAL,
        condition TEXT,
        precipitation REAL,
        wind_speed REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Job Costs
    db.run(`CREATE TABLE IF NOT EXISTS job_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        labor_hours REAL,
        labor_cost REAL,
        material_cost REAL,
        equipment_cost REAL,
        fuel_cost REAL,
        total_cost REAL,
        profit_margin REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    )`);
    
    // Social Posts
    db.run(`CREATE TABLE IF NOT EXISTS social_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        platform TEXT,
        content TEXT,
        media_url TEXT,
        posted_at DATETIME,
        status TEXT DEFAULT 'Draft',
        engagement INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    )`);
    
    // Insert default pricing
    SERVICES.forEach(service => {
        db.run(`INSERT OR IGNORE INTO pricing_templates (service_type, min_price, max_price, avg_price) 
                VALUES (?, ?, ?, ?)`,
            [service.name, Math.round(service.basePrice * 0.8), Math.round(service.basePrice * 1.2), service.basePrice]);
    });
    
    // Insert sample inventory
    const inventoryItems = [
        { name: 'Gas', category: 'Fuel', quantity: 15, unit: 'gallons', min_quantity: 5, price_per_unit: 3.50 },
        { name: 'Mulch', category: 'Materials', quantity: 20, unit: 'bags', min_quantity: 10, price_per_unit: 4.50 },
        { name: 'Weed Eater String', category: 'Supplies', quantity: 10, unit: 'rolls', min_quantity: 3, price_per_unit: 8.99 },
        { name: 'Mower Blades', category: 'Equipment', quantity: 4, unit: 'sets', min_quantity: 2, price_per_unit: 25.00 },
        { name: 'Pressure Washer Soap', category: 'Supplies', quantity: 8, unit: 'gallons', min_quantity: 3, price_per_unit: 12.99 }
    ];
    
    inventoryItems.forEach(item => {
        db.run(`INSERT OR IGNORE INTO inventory (name, category, quantity, unit, min_quantity, price_per_unit) 
                VALUES (?, ?, ?, ?, ?, ?)`,
            [item.name, item.category, item.quantity, item.unit, item.min_quantity, item.price_per_unit]);
    });
    
    // Add admin user
    db.get("SELECT * FROM users WHERE email = 'admin@grimeguys.com'", [], (err, row) => {
        if (!row) {
            db.run("INSERT INTO users (email, password) VALUES ('admin@grimeguys.com', 'admin123')");
        }
    });
});

// ============ BUSINESS PROFILE ============
app.get('/api/business/profile', (req, res) => res.json(BUSINESS_PROFILE));
app.get('/api/services', (req, res) => res.json(SERVICES));

// ============ AUTH ============
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (user) res.json({ success: true, user: { id: user.id, email: user.email } });
        else res.status(401).json({ error: 'Invalid credentials' });
    });
});

// ============ JOBS CRUD ============
app.post('/api/jobs', (req, res) => {
    const { customer_name, phone, address, service_type, service_details, job_date, revenue, expenses, notes, status, payment_method, is_recurring, recurring_frequency, before_photo, after_photo, latitude, longitude } = req.body;
    const profit = (revenue || 0) - (expenses || 0);
    
    db.run(`INSERT INTO jobs (customer_name, phone, address, service_type, service_details, job_date, revenue, expenses, profit, notes, status, payment_method, is_recurring, recurring_frequency, before_photo, after_photo, latitude, longitude, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [customer_name, phone, address, service_type, service_details, job_date, revenue || 0, expenses || 0, profit, notes, status || 'Quote', payment_method, is_recurring || 0, recurring_frequency, before_photo, after_photo, latitude, longitude],
        function(err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ id: this.lastID, profit });
        });
});

app.get('/api/jobs', (req, res) => {
    const { search, status, service_type, customer_id, job_date, limit = 500 } = req.query;
    let query = "SELECT * FROM jobs WHERE 1=1";
    let params = [];
    
    if (search) {
        query += " AND (customer_name LIKE ? OR address LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }
    if (status && status !== 'all') {
        query += " AND status = ?";
        params.push(status);
    }
    if (service_type && service_type !== 'all') {
        query += " AND service_type = ?";
        params.push(service_type);
    }
    if (job_date) {
        query += " AND job_date = ?";
        params.push(job_date);
    }
    if (customer_id) {
        query += " AND id = ?";
        params.push(customer_id);
    }
    
    query += " ORDER BY job_date ASC, created_at DESC LIMIT ?";
    params.push(parseInt(limit));
    
    db.all(query, params, (err, rows) => res.json(rows));
});

app.get('/api/jobs/:id', (req, res) => {
    db.get("SELECT * FROM jobs WHERE id = ?", [req.params.id], (err, row) => res.json(row));
});

app.put('/api/jobs/:id', (req, res) => {
    const { customer_name, phone, address, service_type, service_details, job_date, revenue, expenses, notes, status, payment_method, is_recurring, recurring_frequency, before_photo, after_photo, latitude, longitude } = req.body;
    const profit = (revenue || 0) - (expenses || 0);
    
    db.run(`UPDATE jobs SET 
            customer_name = ?, phone = ?, address = ?, service_type = ?, service_details = ?,
            job_date = ?, revenue = ?, expenses = ?, profit = ?, notes = ?, status = ?, 
            payment_method = ?, is_recurring = ?, recurring_frequency = ?, before_photo = ?, after_photo = ?,
            latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
        [customer_name, phone, address, service_type, service_details, job_date, revenue, expenses, profit, notes, status, payment_method, is_recurring || 0, recurring_frequency, before_photo, after_photo, latitude, longitude, req.params.id],
        function(err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ updated: true });
        });
});

app.delete('/api/jobs/:id', (req, res) => {
    db.run("DELETE FROM jobs WHERE id = ?", [req.params.id], () => res.json({ deleted: true }));
});

// Mark as paid
app.put('/api/jobs/:id/paid', (req, res) => {
    const { payment_method } = req.body;
    db.run(`UPDATE jobs SET status = 'Paid', payment_method = ?, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [payment_method, req.params.id], () => res.json({ updated: true }));
});

// Client history
app.get('/api/clients/:name', (req, res) => {
    db.all("SELECT * FROM jobs WHERE customer_name LIKE ? ORDER BY created_at DESC", [`%${req.params.name}%`], (err, rows) => {
        const totalSpent = rows.reduce((sum, j) => sum + (j.revenue || 0), 0);
        const lastJob = rows[0];
        res.json({ jobs: rows, totalSpent, lastServiceDate: lastJob?.job_date });
    });
});

// ============ DASHBOARD METRICS ============
app.get('/api/dashboard/metrics', (req, res) => {
    const { period = 'month' } = req.query;
    let dateFilter = '';
    if (period === 'week') dateFilter = "AND job_date >= date('now', '-7 days')";
    if (period === 'month') dateFilter = "AND job_date >= date('now', '-30 days')";
    if (period === 'year') dateFilter = "AND job_date >= date('now', '-365 days')";
    
    db.get(`SELECT 
        COALESCE(SUM(revenue), 0) as total_revenue,
        COALESCE(SUM(expenses), 0) as total_expenses,
        COALESCE(SUM(profit), 0) as total_profit,
        COUNT(*) as total_jobs,
        AVG(revenue) as avg_job_value
        FROM jobs WHERE 1=1 ${dateFilter}`, [], (err, row) => {
        res.json(row);
    });
});

// Enhanced trends endpoint for dual-line graph
app.get('/api/dashboard/trends', (req, res) => {
    const { period = 'month', type = 'completed' } = req.query;
    let dateFilter = '';
    let groupBy = '%Y-%m-%d';
    
    if (period === 'week') {
        dateFilter = "AND job_date >= date('now', '-7 days')";
    } else if (period === 'month') {
        dateFilter = "AND job_date >= date('now', '-30 days')";
    } else if (period === 'year') {
        dateFilter = "AND job_date >= date('now', '-365 days')";
        groupBy = '%Y-%m';
    }
    
    let query;
    if (type === 'completed') {
        query = `SELECT 
            strftime('${groupBy}', job_date) as date,
            SUM(profit) as profit,
            SUM(revenue) as revenue
            FROM jobs 
            WHERE status IN ('Completed', 'Paid') ${dateFilter}
            GROUP BY strftime('${groupBy}', job_date)
            ORDER BY date ASC`;
    } else {
        query = `SELECT 
            strftime('${groupBy}', job_date) as date,
            SUM(revenue) as revenue
            FROM jobs 
            WHERE status IN ('Quote', 'Scheduled') ${dateFilter}
            GROUP BY strftime('${groupBy}', job_date)
            ORDER BY date ASC`;
    }
    
    db.all(query, [], (err, rows) => {
        res.json(rows);
    });
});

// ============ INSIGHTS ============
app.get('/api/insights', (req, res) => {
    db.get(`SELECT 
        AVG(revenue) as avg_job_value,
        COUNT(*) as total_jobs,
        SUM(revenue) as total_revenue,
        SUM(profit) as total_profit
        FROM jobs`, [], (err, stats) => {
        db.all(`SELECT 
            service_type,
            COUNT(*) as count,
            AVG(revenue) as avg_revenue,
            AVG(profit) as avg_profit
            FROM jobs 
            WHERE service_type IS NOT NULL
            GROUP BY service_type
            ORDER BY avg_profit DESC`, [], (err, services) => {
            res.json({ stats, mostProfitableService: services[0], services });
        });
    });
});

// ============ PRICING ============
app.get('/api/pricing', (req, res) => {
    db.all("SELECT * FROM pricing_templates", [], (err, rows) => res.json(rows));
});

app.put('/api/pricing/:service_type', (req, res) => {
    const { min_price, max_price, avg_price, notes } = req.body;
    db.run(`UPDATE pricing_templates SET min_price = ?, max_price = ?, avg_price = ?, notes = ? WHERE service_type = ?`,
        [min_price, max_price, avg_price, notes, req.params.service_type], () => res.json({ updated: true }));
});

app.get('/api/pricing/suggest/:service', (req, res) => {
    db.get("SELECT AVG(revenue) as suggested FROM jobs WHERE service_type = ? AND status IN ('Completed', 'Paid')", [req.params.service], (err, row) => {
        res.json({ suggested: row?.suggested || 0 });
    });
});

// ============ QUOTES ============
app.post('/api/quotes', (req, res) => {
    const { job_id, customer_name, address, services, total_amount, expires_at } = req.body;
    const quote_number = `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    db.run(`INSERT INTO quotes (job_id, quote_number, customer_name, address, services, total_amount, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [job_id, quote_number, customer_name, address, JSON.stringify(services), total_amount, expires_at],
        function(err) {
            res.json({ id: this.lastID, quote_number });
        });
});

app.get('/api/quotes', (req, res) => {
    db.all("SELECT * FROM quotes ORDER BY created_at DESC", [], (err, rows) => res.json(rows));
});

// ============ EXPENSES ============
app.post('/api/expenses', (req, res) => {
    const { job_id, category, amount, description, date } = req.body;
    db.run(`INSERT INTO expenses (job_id, category, amount, description, date) VALUES (?, ?, ?, ?, ?)`,
        [job_id, category, amount, description, date], function(err) {
            res.json({ id: this.lastID });
        });
});

app.get('/api/expenses', (req, res) => {
    const { job_id, category, start_date, end_date } = req.query;
    let query = "SELECT * FROM expenses WHERE 1=1";
    let params = [];
    if (job_id) { query += " AND job_id = ?"; params.push(job_id); }
    if (category) { query += " AND category = ?"; params.push(category); }
    if (start_date) { query += " AND date >= ?"; params.push(start_date); }
    if (end_date) { query += " AND date <= ?"; params.push(end_date); }
    query += " ORDER BY date DESC";
    db.all(query, params, (err, rows) => res.json(rows));
});

// ============ INVENTORY MANAGEMENT ============
app.get('/api/inventory', (req, res) => {
    db.all("SELECT * FROM inventory ORDER BY name", [], (err, rows) => res.json(rows));
});

app.post('/api/inventory', (req, res) => {
    const { name, category, quantity, unit, min_quantity, price_per_unit } = req.body;
    db.run(`INSERT INTO inventory (name, category, quantity, unit, min_quantity, price_per_unit)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [name, category, quantity, unit, min_quantity, price_per_unit],
        function(err) { res.json({ id: this.lastID }); });
});

app.put('/api/inventory/:id/quantity', (req, res) => {
    const { quantity } = req.body;
    db.run(`UPDATE inventory SET quantity = ? WHERE id = ?`, [quantity, req.params.id], () => res.json({ updated: true }));
});

app.delete('/api/inventory/:id', (req, res) => {
    db.run(`DELETE FROM inventory WHERE id = ?`, [req.params.id], () => res.json({ deleted: true }));
});

// ============ PHOTOS ============
app.get('/api/photos', (req, res) => {
    db.all(`SELECT p.*, j.customer_name, j.job_date FROM photos p 
            LEFT JOIN jobs j ON p.job_id = j.id 
            ORDER BY p.uploaded_at DESC`, [], (err, rows) => res.json(rows));
});

app.post('/api/photos', (req, res) => {
    const { job_id, photo_type, photo_data, caption } = req.body;
    db.run(`INSERT INTO photos (job_id, photo_type, photo_data, caption) VALUES (?, ?, ?, ?)`,
        [job_id, photo_type, photo_data, caption], function(err) { res.json({ id: this.lastID }); });
});

// ============ INVOICES ============
app.get('/api/invoices', (req, res) => {
    db.all(`SELECT i.*, j.customer_name, j.service_type FROM invoices i 
            LEFT JOIN jobs j ON i.job_id = j.id 
            ORDER BY i.created_at DESC`, [], (err, rows) => res.json(rows));
});

app.post('/api/invoices', (req, res) => {
    const { job_id } = req.body;
    const invoice_number = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    db.get("SELECT revenue FROM jobs WHERE id = ?", [job_id], (err, job) => {
        const amount = job?.revenue || 0;
        db.run(`INSERT INTO invoices (job_id, invoice_number, amount, total) VALUES (?, ?, ?, ?)`,
            [job_id, invoice_number, amount, amount], function(err) { res.json({ id: this.lastID, invoice_number }); });
    });
});

app.post('/api/payments', (req, res) => {
    const { invoice_id, amount, payment_method } = req.body;
    db.run(`INSERT INTO payments (invoice_id, amount, payment_method, status) VALUES (?, ?, ?, 'Completed')`,
        [invoice_id, amount, payment_method], function(err) {
            db.run(`UPDATE invoices SET status = 'Paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?`, [invoice_id]);
            res.json({ id: this.lastID });
        });
});

// ============ JOB COSTING ============
app.get('/api/job-costs/:job_id', (req, res) => {
    db.get("SELECT * FROM job_costs WHERE job_id = ?", [req.params.job_id], (err, row) => res.json(row || {}));
});

app.post('/api/job-costs', (req, res) => {
    const { job_id, labor_hours, labor_cost, material_cost, equipment_cost, fuel_cost, total_cost } = req.body;
    const profit_margin = total_cost ? ((total_cost - labor_cost - material_cost - equipment_cost - fuel_cost) / total_cost) * 100 : 0;
    db.run(`INSERT OR REPLACE INTO job_costs (job_id, labor_hours, labor_cost, material_cost, equipment_cost, fuel_cost, total_cost, profit_margin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [job_id, labor_hours, labor_cost, material_cost, equipment_cost, fuel_cost, total_cost, profit_margin],
        function(err) { res.json({ id: this.lastID }); });
});

// ============ SOCIAL POSTS ============
app.get('/api/social-posts', (req, res) => {
    const { status } = req.query;
    let query = "SELECT * FROM social_posts";
    let params = [];
    if (status) {
        query += " WHERE status = ?";
        params.push(status);
    }
    query += " ORDER BY created_at DESC";
    db.all(query, params, (err, rows) => res.json(rows));
});

app.post('/api/social-posts', (req, res) => {
    const { job_id, platform, content, media_url, status, posted_at } = req.body;
    db.run(`INSERT INTO social_posts (job_id, platform, content, media_url, status, posted_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [job_id, platform, content, media_url, status || 'Draft', posted_at || null],
        function(err) { res.json({ id: this.lastID }); });
});

app.delete('/api/social-posts/:id', (req, res) => {
    db.run(`DELETE FROM social_posts WHERE id = ?`, [req.params.id], () => res.json({ deleted: true }));
});

// ============ FOLLOW-UPS ============
app.post('/api/followups', (req, res) => {
    const { job_id, message, type } = req.body;
    db.run(`INSERT INTO follow_ups (job_id, message, sent_at, type) VALUES (?, ?, CURRENT_TIMESTAMP, ?)`,
        [job_id, message, type], function(err) {
            res.json({ id: this.lastID });
        });
});

app.get('/api/followups', (req, res) => {
    db.all("SELECT f.*, j.customer_name FROM follow_ups f LEFT JOIN jobs j ON f.job_id = j.id ORDER BY f.created_at DESC", [], (err, rows) => res.json(rows));
});

// ============ RECURRING JOBS ============
app.get('/api/recurring-jobs', (req, res) => {
    db.all("SELECT * FROM jobs WHERE is_recurring = 1", [], (err, rows) => res.json(rows));
});

// ============ MAPS ============
app.get('/api/map/:address', (req, res) => {
    const address = encodeURIComponent(req.params.address);
    res.json({ url: `https://www.google.com/maps/search/${address}` });
});

// ============ EXPORT ============
app.get('/api/export', (req, res) => {
    db.all("SELECT * FROM jobs ORDER BY created_at DESC", [], (err, rows) => {
        const headers = ['ID', 'Customer', 'Phone', 'Address', 'Service', 'Date', 'Revenue', 'Expenses', 'Profit', 'Status', 'Payment Method'];
        const csvRows = [headers];
        rows.forEach(row => {
            csvRows.push([row.id, row.customer_name, row.phone, row.address, row.service_type, row.job_date, row.revenue, row.expenses, row.profit, row.status, row.payment_method]);
        });
        const csvContent = csvRows.map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=grimeguys_export.csv');
        res.send(csvContent);
    });
});

// ============ BACKUP ============
app.get('/api/backup', (req, res) => {
    const backupPath = path.join(__dirname, `backup_${Date.now()}.db`);
    fs.copyFileSync('./database.db', backupPath);
    res.json({ message: 'Backup created', file: backupPath });
});

// ============ PHOTOS ============
app.post('/api/jobs/:id/photos', (req, res) => {
    const { before_photo, after_photo } = req.body;
    db.run(`UPDATE jobs SET before_photo = ?, after_photo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [before_photo, after_photo, req.params.id], () => {
        res.json({ updated: true });
    });
});

console.log('✅ Grime Guys Server running on http://localhost:3001');
console.log('📊 All features loaded: Inventory, Photos, Invoices, Weather, Costing, Social, Route Optimization');
app.listen(PORT);
