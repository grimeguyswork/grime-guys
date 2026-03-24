const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// March 2026 calendar data
const calendarData = {
    // Recurring events
    recurring: [
        { day: 0, name: 'Off Work (Church)', category: 'Personal', time: null, startDate: '2026-03-01', endDate: '2026-03-29' }, // Sundays
        { day: 3, name: 'Youth Group', category: 'Personal', time: '18:00', startDate: '2026-03-11', endDate: '2026-03-25' } // Wednesdays
    ],
    
    // One-time events
    events: [
        { date: '2026-03-04', time: '15:30', name: 'Gerri Hillis Lawn Clean Up', category: 'Work', serviceType: 'Mowing', customer: 'Gerri Hillis', revenue: 75, expenses: 0 },
        { date: '2026-03-07', time: null, name: 'Weatherstone Clubhouse Pressure Washing', category: 'Work', serviceType: 'Pressure Washing', customer: 'Weatherstone Clubhouse', revenue: 350, expenses: 25 },
        { date: '2026-03-13', time: null, name: 'Off at Brashier / Weatherstone Pressure Washing', category: 'Work', serviceType: 'Pressure Washing', customer: 'Brashier / Weatherstone', revenue: 250, expenses: 20 },
        { date: '2026-03-28', time: '10:00', name: 'Easter Egg Hunt', category: 'Personal', serviceType: null },
        { date: '2026-03-28', time: '12:00', name: 'Gerri Hillis Mulching', category: 'Work', serviceType: 'Mulch', customer: 'Gerri Hillis', revenue: 150, expenses: 45 },
        { date: '2026-04-04', time: '10:00', name: 'Julie Sosby Pressure Washing', category: 'Work', serviceType: 'Pressure Washing', customer: 'Julie Sosby', revenue: 200, expenses: 15 }
    ],
    
    // Multi-day event (Spring Break)
    multiDay: [
        { startDate: '2026-03-16', endDate: '2026-03-20', name: 'Spring Break: Away for Trip', category: 'Personal' }
    ],
    
    // Mowing season start
    seasonStart: { date: '2026-03-23', name: 'Start of Mowing Season', category: 'Work', serviceType: 'Mowing' }
};

// Helper to get all dates between two dates
function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

// Helper to get all dates for a recurring event
function getRecurringDates(day, startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
        if (currentDate.getDay() === day) {
            dates.push(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

async function importData() {
    console.log('🚀 Starting data import for March 2026...');
    
    // 1. Import recurring events (Sundays - Off Work)
    console.log('\n📅 Importing recurring events...');
    
    const sundayDates = getRecurringDates(0, '2026-03-01', '2026-03-29');
    for (const date of sundayDates) {
        const event = {
            job_date: date,
            customer_name: 'Personal',
            service_type: 'Off Work',
            service_details: 'Church / Rest Day',
            status: 'Scheduled',
            notes: 'Recurring - Off Work',
            revenue: 0,
            expenses: 0
        };
        
        await insertJob(event);
        console.log(`  ✓ Added: Off Work - ${date}`);
    }
    
    // 2. Import Youth Group events
    const youthDates = getRecurringDates(3, '2026-03-11', '2026-03-25');
    for (const date of youthDates) {
        const event = {
            job_date: date,
            customer_name: 'Personal',
            service_type: 'Youth Group',
            service_details: '6:00 PM Youth Group',
            status: 'Scheduled',
            notes: 'Recurring - Youth Group',
            revenue: 0,
            expenses: 0
        };
        
        await insertJob(event);
        console.log(`  ✓ Added: Youth Group - ${date}`);
    }
    
    // 3. Import Spring Break multi-day event
    console.log('\n🏖️ Importing Spring Break...');
    const springBreakDates = getDatesBetween('2026-03-16', '2026-03-20');
    for (const date of springBreakDates) {
        const event = {
            job_date: date,
            customer_name: 'Personal',
            service_type: 'Spring Break',
            service_details: 'Away for Trip',
            status: 'Scheduled',
            notes: 'No work - vacation',
            revenue: 0,
            expenses: 0
        };
        
        await insertJob(event);
        console.log(`  ✓ Added: Spring Break - ${date}`);
    }
    
    // 4. Import one-time work events
    console.log('\n💼 Importing work events...');
    for (const event of calendarData.events) {
        if (event.category === 'Work') {
            const job = {
                job_date: event.date,
                customer_name: event.customer,
                service_type: event.serviceType,
                service_details: event.name,
                status: 'Completed',
                notes: `Imported from calendar: ${event.name}`,
                revenue: event.revenue || 0,
                expenses: event.expenses || 0
            };
            
            await insertJob(job);
            console.log(`  ✓ Added: ${event.name} - ${event.date} - Revenue: $${event.revenue || 0}`);
            
            // Add expenses if any
            if (event.expenses > 0) {
                await insertExpense({
                    job_id: null,
                    category: 'Supplies',
                    amount: event.expenses,
                    description: `Expenses for ${event.name}`,
                    date: event.date
                });
                console.log(`    ✓ Added expenses: $${event.expenses}`);
            }
        } else {
            // Personal events
            const eventJob = {
                job_date: event.date,
                customer_name: 'Personal',
                service_type: event.name,
                service_details: event.time ? `${event.time} - ${event.name}` : event.name,
                status: 'Scheduled',
                notes: 'Personal event',
                revenue: 0,
                expenses: 0
            };
            
            await insertJob(eventJob);
            console.log(`  ✓ Added: ${event.name} - ${event.date}`);
        }
    }
    
    // 5. Add Mowing Season Start
    console.log('\n🌱 Adding Mowing Season Start...');
    const mowingJob = {
        job_date: '2026-03-23',
        customer_name: 'Season Start',
        service_type: 'Mowing',
        service_details: 'Start of Mowing Season',
        status: 'Scheduled',
        notes: 'Regular mowing season begins',
        revenue: 0,
        expenses: 0
    };
    
    await insertJob(mowingJob);
    console.log('  ✓ Added: Start of Mowing Season - 2026-03-23');
    
    // 6. Add Julie Sosby job for April
    console.log('\n📅 Adding April jobs...');
    const julieJob = {
        job_date: '2026-04-04',
        customer_name: 'Julie Sosby',
        service_type: 'Pressure Washing',
        service_details: 'Pressure Washing',
        status: 'Scheduled',
        notes: 'From calendar - Easter weekend',
        revenue: 0,
        expenses: 0
    };
    
    await insertJob(julieJob);
    console.log('  ✓ Added: Julie Sosby Pressure Washing - 2026-04-04');
    
    // 7. Calculate and display summary
    console.log('\n📊 IMPORT SUMMARY');
    console.log('=' .repeat(50));
    
    // Count jobs by type
    db.get(`SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN customer_name = 'Personal' THEN 1 ELSE 0 END) as personal_events,
        SUM(CASE WHEN customer_name != 'Personal' AND revenue > 0 THEN 1 ELSE 0 END) as paid_jobs,
        SUM(revenue) as total_revenue,
        SUM(expenses) as total_expenses
        FROM jobs WHERE job_date >= '2026-03-01'`, [], (err, row) => {
        console.log(`✅ Total Jobs/Events: ${row.total_jobs}`);
        console.log(`✅ Personal Events: ${row.personal_events}`);
        console.log(`✅ Paid Jobs: ${row.paid_jobs}`);
        console.log(`✅ Total Revenue: $${row.total_revenue || 0}`);
        console.log(`✅ Total Expenses: $${row.total_expenses || 0}`);
        console.log(`✅ Projected Profit: $${(row.total_revenue || 0) - (row.total_expenses || 0)}`);
        console.log('\n🎉 Data import complete! All March 2026 events have been added to your system.');
        console.log('📱 Open your browser to view the calendar and jobs!');
        
        db.close();
    });
}

// Helper function to insert job
function insertJob(job) {
    return new Promise((resolve, reject) => {
        const profit = (job.revenue || 0) - (job.expenses || 0);
        
        db.run(`INSERT INTO jobs 
            (customer_name, phone, address, service_type, service_details, job_date, 
             revenue, expenses, profit, notes, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                job.customer_name,
                job.phone || '',
                job.address || '',
                job.service_type,
                job.service_details,
                job.job_date,
                job.revenue || 0,
                job.expenses || 0,
                profit,
                job.notes || '',
                job.status || 'Scheduled'
            ],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

// Helper function to insert expense
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
console.log('=' .repeat(60));
console.log('🧼 GRIME GUYS - MARCH 2026 DATA IMPORTER');
console.log('=' .repeat(60));

importData().catch(err => {
    console.error('Import error:', err);
    db.close();
});
