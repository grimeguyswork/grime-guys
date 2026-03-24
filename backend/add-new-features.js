const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('🚀 Adding new features to database...\n');

db.serialize(() => {
    // 1. Inventory Management Table
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
    
    // 2. Photos Gallery Table
    db.run(`CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        photo_type TEXT,
        photo_data TEXT,
        caption TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    )`);
    
    // 3. Invoices Table
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
    
    // 4. Payments Table
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
    
    // 5. Weather History Table
    db.run(`CREATE TABLE IF NOT EXISTS weather (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE,
        temperature REAL,
        condition TEXT,
        precipitation REAL,
        wind_speed REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // 6. Job Costing Table
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
    
    // 7. Social Media Posts Table
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
    
    // Add route optimization columns to jobs
    db.run("ALTER TABLE jobs ADD COLUMN latitude REAL", () => {});
    db.run("ALTER TABLE jobs ADD COLUMN longitude REAL", () => {});
    db.run("ALTER TABLE jobs ADD COLUMN estimated_travel_time INTEGER", () => {});
    db.run("ALTER TABLE jobs ADD COLUMN order_index INTEGER", () => {});
    
    // Add weather columns to jobs
    db.run("ALTER TABLE jobs ADD COLUMN weather_forecast TEXT", () => {});
    db.run("ALTER TABLE jobs ADD COLUMN weather_checked_at DATETIME", () => {});
    
    console.log('✅ Inventory table created');
    console.log('✅ Photos table created');
    console.log('✅ Invoices table created');
    console.log('✅ Payments table created');
    console.log('✅ Weather table created');
    console.log('✅ Job Costs table created');
    console.log('✅ Social Posts table created');
    console.log('✅ Route columns added to jobs');
    console.log('✅ Weather columns added to jobs');
    
    // Insert sample inventory items
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
    
    console.log('✅ Sample inventory items added');
});

setTimeout(() => {
    db.close();
    console.log('\n🎉 Database upgrade complete! New features ready.');
}, 2000);
