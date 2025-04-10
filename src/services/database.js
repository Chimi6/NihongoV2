// import SQLite from 'react-native-sqlite-storage';

// // Database configuration
// const database_name = 'nihongo.db';
// const TABLE_FAVORITES = 'favorites';
// const TABLE_HISTORY = 'history';

// // Enable both callbacks and promises
// SQLite.enablePromise(true);

// // Global database instance
// let db = null;

// // Database initialization
// export const initDatabase = async () => {
//   try {
//     if (db) return db;

//     db = await SQLite.openDatabase({
//       name: database_name,
//       location: 'default',
//     });

//     // Create favorites table with just the video UID
//     await db.executeSql(`
//       CREATE TABLE IF NOT EXISTS ${TABLE_FAVORITES} (
//         uid TEXT PRIMARY KEY,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     // Create history table
//     await db.executeSql(`
//       CREATE TABLE IF NOT EXISTS ${TABLE_HISTORY} (
//         uid TEXT PRIMARY KEY,
//         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     // Create lists table
//     await db.executeSql(`
//       CREATE TABLE IF NOT EXISTS lists (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT UNIQUE,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     console.log('Database initialized successfully');
//     return db;
//   } catch (error) {
//     console.error('Error initializing database:', error);
//     throw error;
//   }
// };

// // Favorites operations
// export const addToFavorites = async (uid) => {
//   try {
//     if (!db) {
//       await initDatabase();
//     }

//     await db.executeSql(
//       `INSERT OR REPLACE INTO ${TABLE_FAVORITES} (uid) VALUES (?)`,
//       [uid]
//     );

//     console.log('Added to favorites successfully');
//     return true;
//   } catch (error) {
//     console.error('Error adding to favorites:', error);
//     throw error;
//   }
// };

// export const removeFromFavorites = async (uid) => {
//   try {
//     if (!db) {
//       await initDatabase();
//     }

//     await db.executeSql(`DELETE FROM ${TABLE_FAVORITES} WHERE uid = ?`, [uid]);
//     console.log('Removed from favorites successfully');
//     return true;
//   } catch (error) {
//     console.error('Error removing from favorites:', error);
//     throw error;
//   }
// };

// export const getFavorites = async () => {
//   try {
//     if (!db) {
//       await initDatabase();
//     }

//     const [results] = await db.executeSql(
//       `SELECT uid FROM ${TABLE_FAVORITES} ORDER BY created_at DESC`
//     );

//     const favorites = [];
//     for (let i = 0; i < results.rows.length; i++) {
//       favorites.push(results.rows.item(i).uid);
//     }

//     return favorites;
//   } catch (error) {
//     console.error('Error getting favorites:', error);
//     throw error;
//   }
// };

// export const isFavorite = async (uid) => {
//   try {
//     if (!db) {
//       await initDatabase();
//     }

//     const [results] = await db.executeSql(
//       `SELECT COUNT(*) as count FROM ${TABLE_FAVORITES} WHERE uid = ?`,
//       [uid]
//     );
    
//     return results.rows.item(0).count > 0;
//   } catch (error) {
//     console.error('Error checking favorite status:', error);
//     return false;
//   }
// };

// // History operations
// export const addToHistory = async (uid) => {
//   try {
//     console.log(`[DATABASE] Adding to history: ${uid}`);
//     if (!db) {
//       console.log('[DATABASE] Database not initialized, initializing...');
//       await initDatabase();
//     }

//     console.log('[DATABASE] Executing SQL to add to history');
//     const result = await db.executeSql(
//       `INSERT OR REPLACE INTO ${TABLE_HISTORY} (uid, timestamp) VALUES (?, CURRENT_TIMESTAMP)`,
//       [uid]
//     );
//     console.log('[DATABASE] SQL execution result:', JSON.stringify(result));

//     console.log('[DATABASE] Added to history successfully');
//     return true;
//   } catch (error) {
//     console.error('[DATABASE] Error adding to history:', error);
//     throw error;
//   }
// };

// export const getHistory = async () => {
//   try {
//     console.log('[DATABASE] Getting history');
//     if (!db) {
//       console.log('[DATABASE] Database not initialized, initializing...');
//       await initDatabase();
//     }

//     console.log('[DATABASE] Executing SQL to get history');
//     const [results] = await db.executeSql(
//       `SELECT uid, timestamp FROM ${TABLE_HISTORY} ORDER BY timestamp DESC`
//     );
//     console.log('[DATABASE] SQL execution completed, rows:', results.rows.length);

//     const history = [];
//     for (let i = 0; i < results.rows.length; i++) {
//       const item = results.rows.item(i);
//       console.log(`[DATABASE] History item ${i}:`, item);
//       history.push({
//         uid: item.uid,
//         timestamp: item.timestamp
//       });
//     }

//     console.log('[DATABASE] Returning history with', history.length, 'items');
//     return history;
//   } catch (error) {
//     console.error('[DATABASE] Error getting history:', error);
//     throw error;
//   }
// };

// export const isInHistory = async (uid) => {
//   try {
//     if (!db) {
//       await initDatabase();
//     }

//     const [results] = await db.executeSql(
//       `SELECT COUNT(*) as count FROM ${TABLE_HISTORY} WHERE uid = ?`,
//       [uid]
//     );
    
//     return results.rows.item(0).count > 0;
//   } catch (error) {
//     console.error('Error checking history status:', error);
//     return false;
//   }
// }; 