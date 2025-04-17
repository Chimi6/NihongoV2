import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';

let dbInstance = null;

async function prepareDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbName = 'JapanDict.db';
  const dbDir = FileSystem.documentDirectory + 'SQLite';
  const dbPath = `${dbDir}/${dbName}`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(dbPath);

    if (!fileInfo.exists) {
      console.log('[DB] Copying database from assets...');

      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });

      // Load the asset
      const asset = Asset.fromModule(require('../../assets/JapanDict.db'));
      await asset.downloadAsync();

      // Copy the asset into the app's SQLite dir
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: dbPath,
      });

      console.log('[DB] Copy complete');
    } else {
      console.log('[DB] Database already exists');
    }

    // Open the database
    dbInstance = await SQLite.openDatabaseAsync(dbName);
    
    // Initialize app tables
    await initializeAppTables();
    
    return dbInstance;
  } catch (error) {
    console.error('[DB] Error preparing database:', error);
    throw error;
  }
}

async function initializeAppTables() {
  try {
    if (!dbInstance) {
      throw new Error('Database instance not initialized');
    }

    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS favorites (
        uid TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS history (
        uid TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB] App tables initialized');

    // Get all tables
    const tables = await dbInstance.getAllAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);
    
    console.log('\n[DB] All Tables:');
    console.log('----------------');
    if (tables && tables.length > 0) {
      // Get count for each table
      for (const table of tables) {
        const countResult = await dbInstance.getFirstAsync(
          `SELECT COUNT(*) as count FROM ${table.name}`
        );
        console.log(`- ${table.name} (${countResult.count} records)`);
      }
    } else {
      console.log('No tables found');
    }
    console.log('----------------\n');

  } catch (error) {
    console.error('[DB] Error initializing app tables:', error);
    throw error;
  }
}

export async function initDatabase() {
  try {
    return await prepareDatabase();
  } catch (error) {
    console.error('[DB] Error initializing database:', error);
    throw error;
  }
}

export async function addToFavorites(uid) {
  try {
    const db = await initDatabase();
    await db.runAsync('INSERT OR IGNORE INTO favorites (uid) VALUES (?)', [uid]);
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
}

export async function removeFromFavorites(uid) {
  try {
    const db = await initDatabase();
    await db.runAsync('DELETE FROM favorites WHERE uid = ?', [uid]);
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

export async function getFavorites() {
  try {
    const db = await initDatabase();
    const result = await db.getAllAsync('SELECT uid FROM favorites ORDER BY created_at DESC');
    return result.map(row => row.uid);
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

export async function isFavorite(uid) {
  try {
    const db = await initDatabase();
    const result = await db.getFirstAsync('SELECT 1 FROM favorites WHERE uid = ?', [uid]);
    return !!result;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

export async function addToHistory(uid) {
  try {
    const db = await initDatabase();
    await db.runAsync('INSERT OR REPLACE INTO history (uid) VALUES (?)', [uid]);
    return true;
  } catch (error) {
    console.error('Error adding to history:', error);
    return false;
  }
}

export async function getHistory() {
  try {
    const db = await initDatabase();
    return await db.getAllAsync('SELECT uid, timestamp FROM history ORDER BY timestamp DESC');
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

export async function isInHistory(uid) {
  try {
    const db = await initDatabase();
    const result = await db.getFirstAsync('SELECT 1 FROM history WHERE uid = ?', [uid]);
    return !!result;
  } catch (error) {
    console.error('Error checking history status:', error);
    return false;
  }
} 