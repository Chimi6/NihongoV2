/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Suspense, useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import {SQLiteProvider} from 'expo-sqlite';
import {ActivityIndicator, Text, View} from 'react-native';

const App = () => {
  return (
    <SafeAreaProvider>
      <Suspense
        fallback={
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator />
            <Text>Loading db</Text>
          </View>
        }>
        <SQLiteProvider
          databaseName="Limited_Dictionary.db"
          useSuspense={true}
          assetSource={{assetId: require('./assets/database/Limited_Dictionary.db')}}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
};

export default App;
