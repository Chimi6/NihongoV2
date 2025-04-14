/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect, useState } from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import {ActivityIndicator, Text, View} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import {Asset} from 'expo-asset';
import {DbContext} from './dbContext';
const App = () => {
  async function prepareDatabase() {
    const dbName = 'JapanDict.db';
    const dbDir = FileSystem.documentDirectory + 'SQLite';
    const dbPath = `${dbDir}/${dbName}`;

    const fileInfo = await FileSystem.getInfoAsync(dbPath);

    if (!fileInfo.exists) {
      console.log('[DB] Copying database from assets...');

      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(dbDir, {intermediates: true});

      // Load the asset
      const asset = Asset.fromModule(require('./assets/JapanDict.db'));
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

    return SQLite.openDatabaseAsync(dbName);
  }
  const [dbReady, setDbReady] = useState(false);
  const [db, setDb] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const db = await prepareDatabase();

        // Optional: test that it works
        const tables = await db.getAllAsync(
          "SELECT name FROM sqlite_master WHERE type='table'",
        );
        console.log('[DB] Tables:', tables);
        setDb(db);
        setDbReady(true);
      } catch (e) {
        console.error('[DB] Failed to prepare DB:', e);
      }
    })();
  }, []);

  if (!dbReady) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
        <Text>Loading DB...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <DbContext.Provider value={db}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </DbContext.Provider>
    </SafeAreaProvider>
  );
};

export default App;
