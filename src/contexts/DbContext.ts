import React from 'react';
import { SQLiteDatabase } from 'expo-sqlite';

export const DbContext = React.createContext<SQLiteDatabase | null>(null); 