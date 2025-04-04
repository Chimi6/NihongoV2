import SQLite from 'react-native-sqlite-storage';

export interface Database {
  executeSql: (query: string, params?: any[]) => Promise<[SQLite.ResultSet]>;
}

export interface HistoryItem {
  uid: string;
  timestamp: string;
}

// Database configuration
const database_name = "NihongoV2.db";
const database_size = 200000;

// Table names
const TABLE_FAVORITES = 'favorites';
const TABLE_HISTORY = 'history';

// Global database instance
let db: Database | null = null;

// Database initialization
export const initDatabase = async (): Promise<Database> => {
  try {
    if (db) return db;

    const database = await SQLite.openDatabase({
      name: database_name,
      location: 'default',
    });

    // Create favorites table with just the video UID
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS ${TABLE_FAVORITES} (
        uid TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create history table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS ${TABLE_HISTORY} (
        uid TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
    db = database;
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Favorites operations
export const addToFavorites = async (uid: string): Promise<boolean> => {
  try {
    if (!db) {
      await initDatabase();
    }

    await db!.executeSql(
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

export const removeFromFavorites = async (uid: string): Promise<boolean> => {
  try {
    if (!db) {
      await initDatabase();
    }

    await db!.executeSql(`DELETE FROM ${TABLE_FAVORITES} WHERE uid = ?`, [uid]);
    console.log('Removed from favorites successfully');
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const getFavorites = async (): Promise<string[]> => {
  try {
    if (!db) {
      await initDatabase();
    }

    const [results] = await db!.executeSql(`SELECT uid FROM ${TABLE_FAVORITES} ORDER BY created_at DESC`);
    const favorites: string[] = [];
    
    for (let index = 0; index < results.rows.length; index++) {
      favorites.push(results.rows.item(index).uid);
    }

    return favorites;
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

export const isFavorite = async (uid: string): Promise<boolean> => {
  try {
    if (!db) {
      await initDatabase();
    }

    const [results] = await db!.executeSql(
      `SELECT COUNT(*) as count FROM ${TABLE_FAVORITES} WHERE uid = ?`,
      [uid]
    );
    
    return results.rows.item(0).count > 0;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

// History operations
export const addToHistory = async (uid: string): Promise<boolean> => {
  try {
    if (!db) {
      await initDatabase();
    }

    await db!.executeSql(
      `INSERT OR REPLACE INTO ${TABLE_HISTORY} (uid, timestamp) VALUES (?, CURRENT_TIMESTAMP)`,
      [uid]
    );

    console.log('Added to history successfully');
    return true;
  } catch (error) {
    console.error('Error adding to history:', error);
    throw error;
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    if (!db) {
      await initDatabase();
    }

    const [results] = await db!.executeSql(`SELECT uid, timestamp FROM ${TABLE_HISTORY} ORDER BY timestamp DESC`);
    const history: HistoryItem[] = [];
    
    for (let index = 0; index < results.rows.length; index++) {
      history.push({
        uid: results.rows.item(index).uid,
        timestamp: results.rows.item(index).timestamp
      });
    }

    return history;
  } catch (error) {
    console.error('Error getting history:', error);
    throw error;
  }
};

export const isInHistory = async (uid: string): Promise<boolean> => {
  try {
    if (!db) {
      await initDatabase();
    }

    const [results] = await db!.executeSql(
      `SELECT COUNT(*) as count FROM ${TABLE_HISTORY} WHERE uid = ?`,
      [uid]
    );
    
    return results.rows.item(0).count > 0;
  } catch (error) {
    console.error('Error checking history status:', error);
    throw error;
  }
};

