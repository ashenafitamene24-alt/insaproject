// Test MongoDB Connection
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'insa_questioner';

async function testConnection() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        const client = new MongoClient(uri);

        await client.connect();
        console.log('✅ Connected successfully!');

        const db = client.db(dbName);

        // Create a test collection
        const collection = db.collection('test');
        await collection.insertOne({ test: 'Hello from local MongoDB!', timestamp: new Date() });
        console.log('✅ Test document inserted!');

        // List all databases
        const adminDb = client.db().admin();
        const dbs = await adminDb.listDatabases();
        console.log('\n📊 Available databases:');
        dbs.databases.forEach(db => {
            console.log(`   - ${db.name}`);
        });

        await client.close();
        console.log('\n✅ Connection test completed!');
        console.log('👉 Now refresh MongoDB Compass to see the database');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n💡 Make sure MongoDB is running:');
        console.log('   Windows: net start MongoDB');
        console.log('   Or run: mongod');
    }
}

testConnection();
