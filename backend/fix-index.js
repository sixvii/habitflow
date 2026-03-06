const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const fixIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the User collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get current indexes
    const indexes = await usersCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop the username_1 index if it exists
    try {
      await usersCollection.dropIndex('username_1');
      console.log('\n✅ Dropped username_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  username_1 index does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Verify remaining indexes
    const remainingIndexes = await usersCollection.indexes();
    console.log('\n📋 Remaining indexes:');
    remainingIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ Index cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
