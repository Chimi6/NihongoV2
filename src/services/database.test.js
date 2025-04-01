const { initDatabase, addToFavorites, removeFromFavorites, getFavorites, isFavorite } = require('./database');

const testVideoUid = 'test-video-123';

const runTests = async () => {
  try {
    console.log('Starting database tests...');
    
    // Initialize database
    console.log('\n1. Initializing database...');
    await initDatabase();
    
    // Test adding to favorites
    console.log('\n2. Testing addToFavorites...');
    await addToFavorites(testVideoUid);
    
    // Test checking if favorite
    console.log('\n3. Testing isFavorite...');
    const isFav = await isFavorite(testVideoUid);
    console.log(`Is video ${testVideoUid} a favorite? ${isFav}`);
    
    // Test getting all favorites
    console.log('\n4. Testing getFavorites...');
    const favorites = await getFavorites();
    console.log('Current favorites:', favorites);
    
    // Test removing from favorites
    console.log('\n5. Testing removeFromFavorites...');
    await removeFromFavorites(testVideoUid);
    
    // Verify removal
    console.log('\n6. Verifying removal...');
    const isStillFav = await isFavorite(testVideoUid);
    console.log(`Is video ${testVideoUid} still a favorite? ${isStillFav}`);
    
    const updatedFavorites = await getFavorites();
    console.log('Updated favorites list:', updatedFavorites);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

module.exports = { runTests }; 