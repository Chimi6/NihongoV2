/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import {SQLiteProvider} from 'expo-sqlite';

const App = () => {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="JapanDict.db"  >
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
};

export default App;
