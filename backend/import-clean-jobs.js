const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Your exact jobs data
const jobs = [
    { date: '2026-03-04', customer: 'Gerri Hillis', address: '23 Lucerne Ct', service: 'Yard Clean Up', revenue: 100, expenses: 0, status: 'Completed' },
    { date: '2026-03-13', customer: 'Weatherstone HOA', address: '', service: 'Pressure Washing', revenue: 575, expenses: 0, status: 'Completed' },
    { date: '2026-03-23', customer: 'Gerri Hillis', address: '23 Lucerne Ct', service: 'Yard Clean Up', revenue: 0, expenses: 0, status: 'Scheduled' },
    { date: '2026-03-28', customer: 'Gerri Hillis', address: '23 Lucerne Ct', service: 'Mulching', revenue: 0, expenses: 0, status: 'Scheduled' },
    { date: '2026-04-04', customer: 'Julie Sosby', address: '105 Hillstone Dr', service: 'Pressure Washing', revenue: 250, expenses: 0, status: 'Scheduled' },
    { date: '2026-01-29', customer: 'Susan Sofield', address: '109 Weatherstone Ln', service: 'Ice Removal', revenue: 65, expenses: 0, status: 'Completed' },
    { date: '2026-03-01', customer: 'Susan Matthewson', address: '424 Meringer Place', service: 'Pressure Washing', revenue: 560, expenses: 0, status: 'Completed' }
];

async function importJobs() {
    console.log('=' .repeat(60));
    console.log('📊 GRIME GUYS - CLEAN JOB IMPORTER');
    console.log('=' .repeat(60));
    console.log('\n🔄 Importing your exact jobs...\n');
    
    for (const job of jobs) {
        const profit = job.revenue - job.expenses;
        
        await insertJob({
            customer_name: job.customer,
            address: job.address || 'Simpsonville, SC',
            service_type: job.service,
            service_details: `${job.service} - ${job.customer}`,
            job_date: job.date,
            revenue: job.revenue,
            expenses: job.expenses,
            status: job.status,
            profit: profit
        });
        
        console.log(`  ✓ ${job.date} | ${job.customer} | ${job.service} | $${job.revenue} | ${job.status}`);
    }
    
    console.log('\n📊 JOB SUMMARY');
    console.log('=' .repeat(50));
    console.log('✅ Gerri Hillis - Yard Clean Up (3/4 - Completed, 3/23 - Scheduled), Mulching (3/28 - Scheduled)');
    console.log('✅ Weatherstone HOA - Pressure Washing (3/13 - Completed)');
    console.log('✅ Julie Sosby - Pressure Washing (4/4 - Scheduled)');
    console.log('✅ Susan Sofield - Ice Removal (1/29 - Completed)');
    console.log('✅ Susan Matthewson - Pressure Washing (3/1 - Completed)');
    console.log('\n🎉 All jobs imported successfully!');
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
                `Imported from clean data`,
                job.status || 'Scheduled'
            ],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

importJobs().catch(err => {
    console.error('Import error:', err);
}).finally(() => {
    setTimeout(() => {
        db.close();
        console.log('\n✅ Database closed');
    }, 2000);
});
