const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// All 2025 historical data (anonymized)
const historical2025Data = [
    // June 2025
    { date: '2025-06-05', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-06-07', service: 'Pressure Washing', amount: 200, type: 'income' },
    { date: '2025-06-10', service: 'Bush Trimming', amount: 40, type: 'income' },
    { date: '2025-06-12', service: 'Gas', amount: 15, type: 'expense' },
    { date: '2025-06-15', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-06-18', service: 'Mulch', amount: 150, type: 'income' },
    { date: '2025-06-20', service: 'Trailer Rental', amount: 50, type: 'income' },
    { date: '2025-06-22', service: 'Equipment Maintenance', amount: 35, type: 'expense' },
    { date: '2025-06-25', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-06-28', service: 'Leaf Blowing', amount: 60, type: 'income' },
    
    // July 2025
    { date: '2025-07-02', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-07-05', service: 'Pressure Washing', amount: 180, type: 'income' },
    { date: '2025-07-08', service: 'Bush Trimming', amount: 40, type: 'income' },
    { date: '2025-07-10', service: 'Gas', amount: 20, type: 'expense' },
    { date: '2025-07-12', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-07-15', service: 'Mulch', amount: 60, type: 'expense' },
    { date: '2025-07-18', service: 'Yard Cleanup', amount: 85, type: 'income' },
    { date: '2025-07-20', service: 'Trailer Rental', amount: 50, type: 'income' },
    { date: '2025-07-22', service: 'Equipment Repair', amount: 45, type: 'expense' },
    { date: '2025-07-25', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-07-28', service: 'Pressure Washing', amount: 220, type: 'income' },
    { date: '2025-07-30', service: 'Gas', amount: 18, type: 'expense' },
    
    // August 2025
    { date: '2025-08-02', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-08-05', service: 'Bush Trimming', amount: 40, type: 'income' },
    { date: '2025-08-08', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-08-10', service: 'Gas', amount: 22, type: 'expense' },
    { date: '2025-08-12', service: 'Yard Cleanup', amount: 120, type: 'income' },
    { date: '2025-08-15', service: 'Pressure Washing', amount: 190, type: 'income' },
    { date: '2025-08-18', service: 'Mulch', amount: 150, type: 'income' },
    { date: '2025-08-20', service: 'Supplies', amount: 35, type: 'expense' },
    { date: '2025-08-22', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-08-25', service: 'Trailer Rental', amount: 50, type: 'income' },
    { date: '2025-08-28', service: 'Equipment', amount: 40, type: 'expense' },
    { date: '2025-08-30', service: 'Leaf Blowing', amount: 55, type: 'income' },
    
    // September 2025
    { date: '2025-09-03', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-09-06', service: 'Pressure Washing', amount: 250, type: 'income' },
    { date: '2025-09-09', service: 'Bush Trimming', amount: 40, type: 'income' },
    { date: '2025-09-12', service: 'Gas', amount: 25, type: 'expense' },
    { date: '2025-09-15', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-09-18', service: 'Mulch', amount: 55, type: 'expense' },
    { date: '2025-09-20', service: 'Yard Cleanup', amount: 75, type: 'income' },
    { date: '2025-09-23', service: 'Trailer Rental', amount: 50, type: 'income' },
    { date: '2025-09-26', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-09-29', service: 'Equipment', amount: 30, type: 'expense' },
    
    // October 2025
    { date: '2025-10-02', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-10-05', service: 'Leaf Blowing', amount: 35, type: 'income' },
    { date: '2025-10-08', service: 'Pressure Washing', amount: 180, type: 'income' },
    { date: '2025-10-10', service: 'Gas', amount: 20, type: 'expense' },
    { date: '2025-10-12', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-10-15', service: 'Leaf Blowing', amount: 60, type: 'income' },
    { date: '2025-10-18', service: 'Supplies', amount: 25, type: 'expense' },
    { date: '2025-10-20', service: 'Yard Cleanup', amount: 90, type: 'income' },
    { date: '2025-10-22', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-10-25', service: 'Trailer Rental', amount: 50, type: 'income' },
    { date: '2025-10-28', service: 'Gas', amount: 18, type: 'expense' },
    { date: '2025-10-30', service: 'Supplies', amount: 40, type: 'expense' },
    
    // November 2025
    { date: '2025-11-02', service: 'Leaf Blowing', amount: 35, type: 'income' },
    { date: '2025-11-05', service: 'Pressure Washing', amount: 200, type: 'income' },
    { date: '2025-11-08', service: 'Bush Trimming', amount: 40, type: 'income' },
    { date: '2025-11-10', service: 'Gas', amount: 22, type: 'expense' },
    { date: '2025-11-12', service: 'Mowing', amount: 45, type: 'income' },
    { date: '2025-11-15', service: 'Yard Cleanup', amount: 70, type: 'income' },
    { date: '2025-11-18', service: 'Supplies', amount: 30, type: 'expense' },
    { date: '2025-11-20', service: 'Leaf Blowing', amount: 35, type: 'income' },
    { date: '2025-11-22', service: 'Trailer Rental', amount: 50, type: 'income' },
    { date: '2025-11-25', service: 'Equipment', amount: 45, type: 'expense' },
    { date: '2025-11-28', service: 'Mowing', amount: 45, type: 'income' },
    
    // December 2025
    { date: '2025-12-02', service: 'Ice Removal', amount: 80, type: 'income' },
    { date: '2025-12-05', service: 'Pressure Washing', amount: 220, type: 'income' },
    { date: '2025-12-08', service: 'Gas', amount: 20, type: 'expense' },
    { date: '2025-12-10', service: 'Leaf Blowing', amount: 35, type: 'income' },
    { date: '2025-12-12', service: 'Yard Cleanup', amount: 85, type: 'income' },
    { date: '2025-12-15', service: 'Supplies', amount: 35, type: 'expense' },
    { date: '2025-12-18', service: 'Ice Removal', amount: 70, type: 'income' },
    { date: '2025-12-20', service: 'Trailer Rental', amount: 50, type: 'income' },
    { date: '2025-12-22', service: 'Equipment', amount: 40, type: 'expense' },
    { date: '2025-12-25', service: 'Extra Income', amount: 100, type: 'income' }
];

async function import2025Data() {
    console.log('=' .repeat(60));
    console.log('📊 GRIME GUYS - 2025 HISTORICAL DATA IMPORTER (ANONYMIZED)');
    console.log('=' .repeat(60));
    console.log('\n🔄 Importing 2025 historical data...\n');
    
    let incomeCount = 0;
    let expenseCount = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    
    for (const item of historical2025Data) {
        if (item.type === 'income') {
            // Create anonymized job record for income
            const job = {
                customer_name: 'Customer',
                address: 'Simpsonville, SC',
                service_type: item.service,
                service_details: `${item.service} - Historical 2025 data`,
                job_date: item.date,
                revenue: item.amount,
                expenses: 0,
                status: 'Completed',
                notes: `Historical 2025 data - Customer anonymized`,
                profit: item.amount
            };
            
            await insertJob(job);
            incomeCount++;
            totalIncome += item.amount;
            console.log(`  ✓ Income: ${item.service} - $${item.amount} (${item.date}) - Customer: Customer, Simpsonville, SC`);
            
        } else if (item.type === 'expense') {
            // Add expense record
            await insertExpense({
                job_id: null,
                category: item.service,
                amount: item.amount,
                description: `${item.service} - Historical 2025 expense`,
                date: item.date
            });
            
            expenseCount++;
            totalExpenses += item.amount;
            console.log(`  ✓ Expense: ${item.service} - $${item.amount} (${item.date})`);
        }
    }
    
    console.log('\n📊 IMPORT SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Income Records: ${incomeCount}`);
    console.log(`✅ Expense Records: ${expenseCount}`);
    console.log(`💰 Total Income: $${totalIncome.toFixed(2)}`);
    console.log(`💸 Total Expenses: $${totalExpenses.toFixed(2)}`);
    console.log(`📈 Net Profit: $${(totalIncome - totalExpenses).toFixed(2)}`);
    console.log('\n🎉 2025 Historical data import complete!');
    console.log('📱 All customer names anonymized to "Customer"');
    console.log('📍 All addresses set to "Simpsonville, SC"');
    console.log('📊 Refresh your browser to see updated dashboard with 2025 data!\n');
}

function insertJob(job) {
    return new Promise((resolve, reject) => {
        const profit = (job.revenue || 0) - (job.expenses || 0);
        
        db.run(`INSERT INTO jobs 
            (customer_name, phone, address, service_type, service_details, job_date, 
             revenue, expenses, profit, notes, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                job.customer_name,
                '',
                job.address,
                job.service_type,
                job.service_details,
                job.job_date,
                job.revenue || 0,
                job.expenses || 0,
                profit,
                job.notes || '',
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

// Check if data already exists to avoid duplicates
db.get("SELECT COUNT(*) as count FROM jobs WHERE notes LIKE '%Historical 2025%'", [], (err, row) => {
    if (row && row.count > 0) {
        console.log('⚠️  2025 historical data already exists in database. Skipping import.');
        console.log(`   Found ${row.count} existing 2025 historical records.`);
        process.exit(0);
    } else {
        // Run the import
        import2025Data().catch(err => {
            console.error('Import error:', err);
            process.exit(1);
        }).finally(() => {
            setTimeout(() => {
                db.close();
                process.exit(0);
            }, 2000);
        });
    }
});
