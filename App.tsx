/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { initDatabase } from './src/services/database';

const App = () => {
  useEffect(() => {
    console.log('🚀 App starting, initializing database...');
    initDatabase()
      .then(() => console.log('✅ Database initialized successfully'))
      .catch(error => console.error('❌ Error initializing database:', error));
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
