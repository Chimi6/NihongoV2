const SQLite = require('react-native-sqlite-storage');

// Enable SQLite debugging
SQLite.enablePromise(true);

// Database configuration
const database_name = "NihongoV2.db";
const database_version = "1.0";
const database_display_name = "NihongoV2 SQLite Database";
const database_size = 200000;

// Table names
const TABLE_FAVORITES = 'favorites';

// Global database instance
let db = null;

// Database initialization
const initDatabase = async () => {
  try {
    if (db) return db;

    db = await SQLite.openDatabase({
      name: database_name,
      version: database_version,
      displayName: database_display_name,
      size: database_size,
    });

    // Create favorites table with just the video UID
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS ${TABLE_FAVORITES} (
        uid TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Favorites operations
const addToFavorites = async (uid) => {
  try {
    if (!db) {
      await initDatabase();
    }

    await db.executeSql(
      `INSERT OR REPLACE INTO ${TABLE_FAVORITES} (uid) VALUES (?)`,
      [uid]
    );

    console.log('Added to favorites successfully');
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

const removeFromFavorites = async (uid) => {
  try {
    if (!db) {
      await initDatabase();
    }

    await db.executeSql(`DELETE FROM ${TABLE_FAVORITES} WHERE uid = ?`, [uid]);
    console.log('Removed from favorites successfully');
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

const getFavorites = async () => {
  try {
    if (!db) {
      await initDatabase();
    }

    const [results] = await db.executeSql(`SELECT uid FROM ${TABLE_FAVORITES} ORDER BY created_at DESC`);
    const favorites = [];
    
    for (let index = 0; index < results.rows.length; index++) {
      favorites.push(results.rows.item(index).uid);
    }

    return favorites;
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

const isFavorite = async (uid) => {
  try {
    if (!db) {
      await initDatabase();
    }

    const [results] = await db.executeSql(
      `SELECT COUNT(*) as count FROM ${TABLE_FAVORITES} WHERE uid = ?`,
      [uid]
    );
    
    return results.rows.item(0).count > 0;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

// Initialize database when the module is imported
initDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});

module.exports = {
  initDatabase,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  isFavorite
}; 