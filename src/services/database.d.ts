import SQLite from 'react-native-sqlite-storage';

export interface Database {
  executeSql: (query: string, params?: any[]) => Promise<[SQLite.ResultSet, SQLite.ResultSet]>;
}

export interface HistoryItem {
  uid: string;
  timestamp: string;
}

declare module '../services/database.js' {
  export interface HistoryItem {
    uid: string;
    timestamp: string;
  }

  export function initDatabase(): Promise<any>;
  export function addToFavorites(uid: string): Promise<boolean>;
  export function removeFromFavorites(uid: string): Promise<boolean>;
  export function getFavorites(): Promise<string[]>;
  export function isFavorite(uid: string): Promise<boolean>;
  export function addToHistory(uid: string): Promise<boolean>;
  export function getHistory(): Promise<HistoryItem[]>;
  export function isInHistory(uid: string): Promise<boolean>;
}
