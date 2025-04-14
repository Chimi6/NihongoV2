import React, {createContext, useContext} from 'react';

export const DbContext = createContext(null);

export const useDb = () => useContext(DbContext);
