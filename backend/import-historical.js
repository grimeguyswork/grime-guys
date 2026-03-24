const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Historical data from June 2025 - January 2026
const historicalData = [
    // June 2025
    { date: '2025-06-05', description: 'Lawn Mowing - G. Hillis', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-06-07', description: 'Pressure Washing - Weatherstone', type: 'income', amount: 200, category: 'Pressure Washing' },
    { date: '2025-06-10', description: 'Bush Trimming - Sosby', type: 'income', amount: 40, category: 'Bush Trimming' },
    { date: '2025-06-12', description: 'Gas for mower', type: 'expense', amount: 15, category: 'Gas' },
    { date: '2025-06-15', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-06-18', description: 'Mulching - Hillis', type: 'income', amount: 150, category: 'Mulch' },
    { date: '2025-06-20', description: 'Trailer Rental', type: 'income', amount: 50, category: 'Trailer' },
    { date: '2025-06-22', description: 'Equipment maintenance', type: 'expense', amount: 35, category: 'Equipment' },
    { date: '2025-06-25', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-06-28', description: 'Extra Income - Leaf Cleanup', type: 'income', amount: 60, category: 'Leaf Blowing' },
    
    // July 2025
    { date: '2025-07-02', description: 'Lawn Mowing - G. Hillis', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-07-05', description: 'Pressure Washing - Driveway', type: 'income', amount: 180, category: 'Pressure Washing' },
    { date: '2025-07-08', description: 'Bush Trimming - Regular', type: 'income', amount: 40, category: 'Bush Trimming' },
    { date: '2025-07-10', description: 'Gas', type: 'expense', amount: 20, category: 'Gas' },
    { date: '2025-07-12', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-07-15', description: 'Mulch delivery', type: 'expense', amount: 60, category: 'Supplies' },
    { date: '2025-07-18', description: 'Extra Income - Yard Cleanup', type: 'income', amount: 85, category: 'Yard Cleanup' },
    { date: '2025-07-20', description: 'Trailer Rental', type: 'income', amount: 50, category: 'Trailer' },
    { date: '2025-07-22', description: 'Equipment repair', type: 'expense', amount: 45, category: 'Equipment' },
    { date: '2025-07-25', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-07-28', description: 'Pressure Washing - Deck', type: 'income', amount: 220, category: 'Pressure Washing' },
    { date: '2025-07-30', description: 'Gas', type: 'expense', amount: 18, category: 'Gas' },
    
    // August 2025
    { date: '2025-08-02', description: 'Lawn Mowing - G. Hillis', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-08-05', description: 'Bush Trimming - Sosby', type: 'income', amount: 40, category: 'Bush Trimming' },
    { date: '2025-08-08', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-08-10', description: 'Gas', type: 'expense', amount: 22, category: 'Gas' },
    { date: '2025-08-12', description: 'Extra Income - Storm Cleanup', type: 'income', amount: 120, category: 'Yard Cleanup' },
    { date: '2025-08-15', description: 'Pressure Washing - Fence', type: 'income', amount: 190, category: 'Pressure Washing' },
    { date: '2025-08-18', description: 'Mulching - Hillis', type: 'income', amount: 150, category: 'Mulch' },
    { date: '2025-08-20', description: 'Supplies', type: 'expense', amount: 35, category: 'Supplies' },
    { date: '2025-08-22', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-08-25', description: 'Trailer Rental', type: 'income', amount: 50, category: 'Trailer' },
    { date: '2025-08-28', description: 'Equipment', type: 'expense', amount: 40, category: 'Equipment' },
    { date: '2025-08-30', description: 'Extra Income - Leaf Blowing', type: 'income', amount: 55, category: 'Leaf Blowing' },
    
    // September 2025
    { date: '2025-09-03', description: 'Lawn Mowing - G. Hillis', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-09-06', description: 'Pressure Washing - Clubhouse', type: 'income', amount: 250, category: 'Pressure Washing' },
    { date: '2025-09-09', description: 'Bush Trimming - Regular', type: 'income', amount: 40, category: 'Bush Trimming' },
    { date: '2025-09-12', description: 'Gas', type: 'expense', amount: 25, category: 'Gas' },
    { date: '2025-09-15', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-09-18', description: 'Mulch delivery', type: 'expense', amount: 55, category: 'Supplies' },
    { date: '2025-09-20', description: 'Extra Income - Cleanup', type: 'income', amount: 75, category: 'Yard Cleanup' },
    { date: '2025-09-23', description: 'Trailer Rental', type: 'income', amount: 50, category: 'Trailer' },
    { date: '2025-09-26', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-09-29', description: 'Equipment maintenance', type: 'expense', amount: 30, category: 'Equipment' },
    
    // October 2025
    { date: '2025-10-02', description: 'Lawn Mowing - G. Hillis', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-10-05', description: 'Leaf Blowing - Sosby', type: 'income', amount: 35, category: 'Leaf Blowing' },
    { date: '2025-10-08', description: 'Pressure Washing - Driveway', type: 'income', amount: 180, category: 'Pressure Washing' },
    { date: '2025-10-10', description: 'Gas', type: 'expense', amount: 20, category: 'Gas' },
    { date: '2025-10-12', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-10-15', description: 'Leaf Cleanup - Hillis', type: 'income', amount: 60, category: 'Leaf Blowing' },
    { date: '2025-10-18', description: 'Supplies', type: 'expense', amount: 25, category: 'Supplies' },
    { date: '2025-10-20', description: 'Extra Income - Yard Cleanup', type: 'income', amount: 90, category: 'Yard Cleanup' },
    { date: '2025-10-22', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-10-25', description: 'Trailer Rental', type: 'income', amount: 50, category: 'Trailer' },
    { date: '2025-10-28', description: 'Gas', type: 'expense', amount: 18, category: 'Gas' },
    { date: '2025-10-30', description: 'Ice Removal Prep', type: 'expense', amount: 40, category: 'Supplies' },
    
    // November 2025
    { date: '2025-11-02', description: 'Leaf Blowing - G. Hillis', type: 'income', amount: 35, category: 'Leaf Blowing' },
    { date: '2025-11-05', description: 'Pressure Washing - Deck', type: 'income', amount: 200, category: 'Pressure Washing' },
    { date: '2025-11-08', description: 'Bush Trimming - Sosby', type: 'income', amount: 40, category: 'Bush Trimming' },
    { date: '2025-11-10', description: 'Gas', type: 'expense', amount: 22, category: 'Gas' },
    { date: '2025-11-12', description: 'Lawn Mowing - Regular', type: 'income', amount: 45, category: 'Mowing' },
    { date: '2025-11-15', description: 'Extra Income - Cleanup', type: 'income', amount: 70, category: 'Yard Cleanup' },
    { date: '2025-11-18', description: 'Supplies', type: 'expense', amount: 30, category: 'Supplies' },
    { date: '2025-11-20', description: 'Leaf Blowing - Regular', type: 'income', amount: 35, category: 'Leaf Blowing' },
    { date: '2025-11-22', description: 'Trailer Rental', type: 'income', amount: 50, category: 'Trailer' },
    { date: '2025-11-25', description: 'Equipment repair', type: 'expense', amount: 45, category: 'Equipment' },
    { date: '2025-11-28', description: 'Lawn Mowing - Final', type: 'income', amount: 45, category: 'Mowing' },
    
    // December 2025
    { date: '2025-12-02', description: 'Ice Removal - Hillis', type: 'income', amount: 80, category: 'Ice Removal' },
    { date: '2025-12-05', description: 'Pressure Washing - Holiday Prep', type: 'income', amount: 220, category: 'Pressure Washing' },
    { date: '2025-12-08', description: 'Gas', type: 'expense', amount: 20, category: 'Gas' },
    { date: '2025-12-10', description: 'Leaf Blowing - Sosby', type: 'income', amount: 35, category: 'Leaf Blowing' },
    { date: '2025-12-12', description: 'Extra Income - Cleanup', type: 'income', amount: 85, category: 'Yard Cleanup' },
    { date: '2025-12-15', description: 'Supplies - Salt', type: 'expense', amount: 35, category: 'Supplies' },
    { date: '2025-12-18', description: 'Ice Removal - Regular', type: 'income', amount: 70, category: 'Ice Removal' },
    { date: '2025-12-20', description: 'Trailer Rental', type: 'income', amount: 50, category: 'Trailer' },
    { date: '2025-12-22', description: 'Equipment maintenance', type: 'expense', amount: 40, category: 'Equipment' },
    { date: '2025-12-25', description: 'Holiday Bonus - Extra', type: 'income', amount: 100, category: 'Extra Income' },
    
    // January 2026
    { date: '2026-01-05', description: 'Ice Removal - Hillis', type: 'income', amount: 80, category: 'Ice Removal' },
    { date: '2026-01-08', description: 'Pressure Washing - Winter Prep', type: 'income', amount: 180, category: 'Pressure Washing' },
    { date: '2026-01-10', description: 'Gas', type: 'expense', amount: 25, category: 'Gas' },
    { date: '2026-01-12', description: 'Leaf Blowing - Cleanup', type: 'income', amount: 35, category: 'Leaf Blowing' },
    { date: '2026-01-15', description: 'Extra Income - Yard Cleanup', type: 'income', amount: 65, category: 'Yard Cleanup' },
    { date: '2026-01-18', description: 'Supplies', type: 'expense', amount: 30, category: 'Supplies' },
    { date: '2026-01-20', description: 'Ice Removal - Sosby', type: 'income', amount: 70, category: 'Ice Removal' },
    { date: '2026-01-22', description: 'Trailer Rental', type: 'income', amount: 50, category: 'Trailer' },
    { date: '2026-01-25', description: 'Equipment repair', type: 'expense', amount: 35, category: 'Equipment' },
    { date: '2026-01-28', description: 'Bush Trimming - Winter Prep', type: 'income', amount: 40, category: 'Bush Trimming' },
    { date: '2026-01-30', description: 'End of Month Bonus', type: 'income', amount: 150, category: 'Extra Income' }
];

async function importHistoricalData() {
    console.log('=' .repeat(60));
    console.log('📊 GRIME GUYS - HISTORICAL DATA IMPORTER');
    console.log('=' .repeat(60));
    console.log('\n🔄 Importing historical data from June 2025 - January 2026...\n');
    
    let incomeCount = 0;
    let expenseCount = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    
    for (const item of historicalData) {
        if (item.type === 'income') {
            // Create job record for income
            const job = {
                customer_name: item.description.split(' - ')[1] || 'Customer',
                service_type: item.category,
                service_details: item.description,
                job_date: item.date,
                revenue: item.amount,
                expenses: 0,
                status: 'Completed',
                notes: `Historical data - Imported from records`,
                profit: item.amount
            };
            
            await insertJob(job);
            incomeCount++;
            totalIncome += item.amount;
            console.log(`  ✓ Income: ${item.description} - $${item.amount} (${item.date})`);
            
        } else if (item.type === 'expense') {
            // Add expense record
            await insertExpense({
                job_id: null,
                category: item.category,
                amount: item.amount,
                description: item.description,
                date: item.date
            });
            
            expenseCount++;
            totalExpenses += item.amount;
            console.log(`  ✓ Expense: ${item.description} - $${item.amount} (${item.date})`);
        }
    }
    
    console.log('\n📊 IMPORT SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Income Records: ${incomeCount}`);
    console.log(`✅ Expense Records: ${expenseCount}`);
    console.log(`💰 Total Income: $${totalIncome.toFixed(2)}`);
    console.log(`💸 Total Expenses: $${totalExpenses.toFixed(2)}`);
    console.log(`📈 Net Profit: $${(totalIncome - totalExpenses).toFixed(2)}`);
    console.log('\n🎉 Historical data import complete!');
    console.log('📱 Refresh your browser to see updated dashboard with historical profits!\n');
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
                '',
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

// Run the import
importHistoricalData().catch(err => {
    console.error('Import error:', err);
    process.exit(1);
}).finally(() => {
    setTimeout(() => {
        db.close();
        process.exit(0);
    }, 2000);
});
