import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform, Linking } from 'react-native';

// Database configuration
const database_name = 'nihongo.db';
const TABLE_FAVORITES = 'favorites';
const TABLE_HISTORY = 'history';

// Enable both callbacks and promises
// SQLite.enablePromise(true);

// Global database instance
let db = null;

const copyAssetToDocuments = async (assetFileName, destinationFileName) => {
  console.log('🚀 Starting DB copy...');
  const destPath = `${RNFS.DocumentDirectoryPath}/${assetFileName}`;
  const isDev = __DEV__;
  const shouldForceOverwrite = isDev;

  const exists = await RNFS.exists(destPath);

  try {
    if (Platform.OS === 'android') {
      if (exists && shouldForceOverwrite) {
        await RNFS.unlink(destPath);
        console.log('🗑️ Existing DB deleted');
      }
      await RNFS.copyFileAssets(assetFileName, destPath);
      console.log('✅ Copied DB from assets');
      const stat = await RNFS.stat(destPath);
      console.log('📏 DB file size:', stat.size);
      return destPath;
    } else if (Platform.OS === 'ios') {
      const sourcePath = `${RNFS.MainBundlePath}/${assetFileName}`; // Path to bundled resources on iOS
      if (exists && shouldForceOverwrite) {
        await RNFS.unlink(destPath);
        console.log('🗑️ Existing DB deleted');
      }
      await RNFS.copyFile(sourcePath, destPath);
      console.log('✅ Copied DB from bundle (iOS) to:', destPath);
      const stat = await RNFS.stat(destPath);
      console.log('📏 DB file size:', stat.size);
      return destPath;
    } else {
      console.warn('⚠️ Unsupported platform for DB copy.');
      return null;
    }
  } catch (err) {
    console.error('❌ Error copying DB from assets:', err);
    return null;
  }
};


export async function copyDatabase() {
  const dbName = 'JapanDict.db';

  // const sourcePath = `${RNFS.MainBundlePath}/assets/${dbName}`;
  // console.log('Database sourcePath directory' + sourcePath);
  // const destinationPath = `${RNFS.DocumentDirectoryPath}/${dbName}`;
  // const destPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${dbName}`;
  // console.log('Database destinationPath directory' + destPath);

  // const exists = await RNFS.exists(destPath);
  // // 👇 Force overwrite — during development
  // const shouldForceCopy = true;

  // if (!exists || shouldForceCopy) {
  // try {
  // const exists = await RNFetchBlob.fs.exists(destPath);
  // console.log('✅ File to Copy exists '+ exists);
  // if (!exists) {
  //   try {
  //     await RNFetchBlob.fs.cp(dbName, destPath);
  //     console.log('✅ Copied DB from assets to Documents');
  //   } catch (err) {
  //     console.error('❌ Error copying DB:', err);
  //   }
  // } else {
  //   console.log('✅ DB already exists');
  // }
  // let sourcePath;
  // if (Platform.OS === 'ios') {
  //   sourcePath = `${RNFS.MainBundlePath}/${dbName}`; // iOS
  //   console.log('📦 iOS DB source:', sourcePath);
  //   await RNFS.copyFile(sourcePath, destinationPath);
  // } else {
  //   const data = await RNFS.readFileAssets(dbName, 'base64');
  //   await RNFS.writeFile(destinationPath, data, 'base64');
  //   console.log('📦 Android DB written from assets');
  // }

  //   console.log('✅ Database copied successfully');
  // } catch (err) {
  //   console.error('❌ Failed to copy database:', err);
  // }
  // } else {
  //   console.log('✅ Database exists');
  // }
}


export const listAllTables = async () => {
  if (!db) {
    console.error('❌ DB not opened yet!');
    return;
  }

  // const exists = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/JapanDict.db`);
  // console.log(`📂 Database file exists: ${exists}`);

  db.transaction(tx => {
    tx.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
      [],
      (tx, results) => {
        const len = results.rows.length;
        console.log(`📋 Found ${len} tables:`);
        for (let i = 0; i < len; i++) {
          const table = results.rows.item(i);
          console.log(`🧾 Table: ${table.name}`);
        }
      },
      (tx, error) => {
        console.error('❌ Error fetching tables:', error);
      }
    );
  });

  const entries = await getEntries();
  console.log(entries);
};

// Database initialization
export const initDatabase = async () => {
  try {
    const dbName = 'JapanDict.db';

    const copiedDbPath = await copyAssetToDocuments(dbName, dbName);

    if (!copiedDbPath) {
      console.warn('⚠️ No copied database path provided.');
      return null;
    }

    // if (db) return db;

    if (Platform.OS === 'android') {
      db = await SQLite.openDatabase({ name: copiedDbPath, location: 'default' });
    } else if (Platform.OS === 'ios') {
      db = await SQLite.openDatabase({ name: 'JapanDict.db', location: 'Documents' });
    } else {
      console.warn('⚠️ Unsupported platform for DB copy.');
      return null;
    }

    // console.log('📂 Opened database:', JSON.stringify(db));

    await listAllTables();

    // Create favorites table with just the video UID
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS ${TABLE_FAVORITES} (
        uid TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create history table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS ${TABLE_HISTORY} (
        uid TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // // Create lists table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
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
export const addToFavorites = async (uid) => {
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

export const removeFromFavorites = async (uid) => {
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

export const getFavorites = async () => {
  try {
    if (!db) {
      await initDatabase();
    }

    const [results] = await db.executeSql(
      `SELECT uid FROM ${TABLE_FAVORITES} ORDER BY created_at DESC`
    );

    const favorites = [];
    for (let i = 0; i < results.rows.length; i++) {
      favorites.push(results.rows.item(i).uid);
    }

    return favorites;
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

export const isFavorite = async (uid) => {
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
    return false;
  }
};

// History operations
export const addToHistory = async (uid) => {
  try {
    console.log(`[DATABASE] Adding to history: ${uid}`);
    if (!db) {
      console.log('[DATABASE] Database not initialized, initializing...');
      await initDatabase();
    }

    console.log('[DATABASE] Executing SQL to add to history');
    const result = await db.executeSql(
      `INSERT OR REPLACE INTO ${TABLE_HISTORY} (uid, timestamp) VALUES (?, CURRENT_TIMESTAMP)`,
      [uid]
    );
    console.log('[DATABASE] SQL execution result:', JSON.stringify(result));

    console.log('[DATABASE] Added to history successfully');
    return true;
  } catch (error) {
    console.error('[DATABASE] Error adding to history:', error);
    throw error;
  }
};

export const getHistory = async () => {
  try {
    console.log('[DATABASE] Getting history');
    if (!db) {
      console.log('[DATABASE] Database not initialized, initializing...');
      await initDatabase();
    }

    console.log('[DATABASE] Executing SQL to get history');
    const [results] = await db.executeSql(
      `SELECT uid, timestamp FROM ${TABLE_HISTORY} ORDER BY timestamp DESC`
    );
    console.log('[DATABASE] SQL execution completed, rows:', results.rows.length);

    const history = [];
    for (let i = 0; i < results.rows.length; i++) {
      const item = results.rows.item(i);
      console.log(`[DATABASE] History item ${i}:`, item);
      history.push({
        uid: item.uid,
        timestamp: item.timestamp
      });
    }

    console.log('[DATABASE] Returning history with', history.length, 'items');
    return history;
  } catch (error) {
    console.error('[DATABASE] Error getting history:', error);
    throw error;
  }
};

export const isInHistory = async (uid) => {
  try {
    if (!db) {
      await initDatabase();
    }

    const [results] = await db.executeSql(
      `SELECT COUNT(*) as count FROM ${TABLE_HISTORY} WHERE uid = ?`,
      [uid]
    );

    return results.rows.item(0).count > 0;
  } catch (error) {
    console.error('Error checking history status:', error);
    return false;
  }
};

export const getEntries = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM entries ORDER BY id DESC LIMIT 100`,
        [],
        (txObj, results) => {
          const entries = [];
          for (let i = 0; i < results.rows.length; i++) {
            entries.push(results.rows.item(i));
          }
          resolve(entries);
        },
        (txObj, error) => {
          console.error('❌ Error getting entries:', error);
          reject(error);
        }
      );
    });
  });
};
