const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Correct clients and their jobs from your data
const correctJobs = [
    // March 2026 jobs
    { date: '2026-03-04', customer: 'Gerri Hillis', service: 'Lawn Clean Up', revenue: 75, expenses: 0, status: 'Completed' },
    { date: '2026-03-07', customer: 'Weatherstone Clubhouse', service: 'Pressure Washing', revenue: 350, expenses: 25, status: 'Completed' },
    { date: '2026-03-13', customer: 'Weatherstone Clubhouse', service: 'Pressure Washing', revenue: 250, expenses: 20, status: 'Completed' },
    { date: '2026-03-28', customer: 'Gerri Hillis', service: 'Mulching', revenue: 150, expenses: 45, status: 'Completed' },
    { date: '2026-04-04', customer: 'Julie Sosby', service: 'Pressure Washing', revenue: 200, expenses: 15, status: 'Scheduled' },
    
    // Additional real clients from your data
    { date: '2025-10-15', customer: 'Weatherstone Clubhouse', service: 'Pressure Washing', revenue: 220, expenses: 0, status: 'Completed' },
    { date: '2025-08-18', customer: 'Gerri Hillis', service: 'Mulching', revenue: 150, expenses: 0, status: 'Completed' },
    { date: '2025-06-18', customer: 'Gerri Hillis', service: 'Mulching', revenue: 150, expenses: 0, status: 'Completed' },
    { date: '2025-07-28', customer: 'Julie Sosby', service: 'Pressure Washing', revenue: 180, expenses: 0, status: 'Completed' },
    { date: '2025-11-05', customer: 'Julie Sosby', service: 'Pressure Washing', revenue: 200, expenses: 0, status: 'Completed' },
];

async function importCorrectClients() {
    console.log('=' .repeat(60));
    console.log('📊 GRIME GUYS - CORRECT CLIENT DATA IMPORTER');
    console.log('=' .repeat(60));
    console.log('\n🔄 Importing correct client data...\n');
    
    for (const job of correctJobs) {
        const profit = job.revenue - job.expenses;
        
        await insertJob({
            customer_name: job.customer,
            address: job.customer === 'Weatherstone Clubhouse' ? 'Weatherstone, Simpsonville, SC' : 
                     job.customer === 'Gerri Hillis' ? 'Gerri Hillis Residence, Simpsonville, SC' :
                     job.customer === 'Julie Sosby' ? 'Julie Sosby Residence, Simpsonville, SC' : 'Simpsonville, SC',
            service_type: job.service,
            service_details: `${job.service} - ${job.customer}`,
            job_date: job.date,
            revenue: job.revenue,
            expenses: job.expenses,
            status: job.status,
            profit: profit
        });
        
        console.log(`  ✓ ${job.customer} - ${job.service} - $${job.revenue} (${job.date})`);
        
        // Add expenses if any
        if (job.expenses > 0) {
            await insertExpense({
                job_id: null,
                category: 'Supplies',
                amount: job.expenses,
                description: `Supplies for ${job.customer} - ${job.service}`,
                date: job.date
            });
            console.log(`      ✓ Expenses: $${job.expenses}`);
        }
    }
    
    console.log('\n📊 CLIENT SUMMARY');
    console.log('=' .repeat(50));
    console.log('✅ Gerri Hillis - Multiple jobs (Lawn Clean Up, Mulching)');
    console.log('✅ Weatherstone Clubhouse - Pressure Washing jobs');
    console.log('✅ Julie Sosby - Pressure Washing jobs');
    console.log('\n🎉 Correct client data import complete!');
}

function insertJob(job) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO jobs 
            (customer_name, address, service_type, service_details, job_date, 
             revenue, expenses, profit, notes, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                job.customer_name,
                job.address,
                job.service_type,
                job.service_details,
                job.job_date,
                job.revenue || 0,
                job.expenses || 0,
                job.profit,
                `Imported from correct client data`,
                job.status || 'Completed'
            ],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

function insertExpense(expense) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO expenses 
            (job_id, category, amount, description, date, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [expense.job_id, expense.category, expense.amount, expense.description, expense.date],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

importCorrectClients().catch(err => {
    console.error('Import error:', err);
}).finally(() => {
    setTimeout(() => {
        db.close();
        console.log('\n✅ Database closed');
    }, 2000);
});
