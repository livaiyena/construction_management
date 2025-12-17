// Test script to verify audit logging
const { query } = require('./config/db-raw');
const AuditLogger = require('./utils/auditLogger');

async function testAuditLog() {
    try {
        console.log('🧪 Testing Audit Logger...\n');

        // Test 1: Manual log creation
        console.log('Test 1: Creating a test log...');
        await AuditLogger.log({
            userId: 1,
            userName: 'Test User',
            action: 'CREATE',
            tableName: 'Projects',
            recordId: 999,
            changes: { test: 'data' },
            req: {
                headers: { 'user-agent': 'Test Script' },
                socket: { remoteAddress: '127.0.0.1' },
                ip: '127.0.0.1'
            }
        });
        console.log('✅ Test log created\n');

        // Test 2: Query recent logs
        console.log('Test 2: Fetching recent logs...');
        const result = await query('SELECT * FROM "AuditLogs" ORDER BY "createdAt" DESC LIMIT 5');
        console.log(`✅ Found ${result.rows.length} logs:\n`);
        
        result.rows.forEach((log, i) => {
            console.log(`Log ${i + 1}:`);
            console.log(`  - Action: ${log.action}`);
            console.log(`  - Table: ${log.tableName}`);
            console.log(`  - User: ${log.userName} (ID: ${log.userId})`);
            console.log(`  - Time: ${log.createdAt}`);
            console.log(`  - IP: ${log.ipAddress}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testAuditLog();
