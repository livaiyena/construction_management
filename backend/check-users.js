// Check users in database
const { query } = require('./config/db-raw');

async function checkUsers() {
    try {
        const result = await query('SELECT id, name, email, role FROM "Users"');
        console.log(`📋 Total Users: ${result.rows.length}\n`);
        
        result.rows.forEach(user => {
            console.log(`User #${user.id}:`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}`);
            console.log('');
        });

        // Check recent audit logs per user
        console.log('\n📊 Audit Log Statistics by User:\n');
        const logStats = await query(`
            SELECT 
                "userId", 
                "userName",
                COUNT(*) as log_count,
                MAX("createdAt") as last_activity
            FROM "AuditLogs"
            GROUP BY "userId", "userName"
            ORDER BY log_count DESC
        `);

        logStats.rows.forEach(stat => {
            console.log(`User ID ${stat.userId || 'NULL'} (${stat.userName}):`);
            console.log(`  Total Logs: ${stat.log_count}`);
            console.log(`  Last Activity: ${stat.last_activity}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
