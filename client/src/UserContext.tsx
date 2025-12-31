/*
import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface UserInfo {
  id: string;
  username: string;
}

interface UserContextType {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

// Create context with proper type and default value
export const UserContext = createContext<UserContextType>({
  userInfo: null,
  setUserInfo: () => {},
});

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};*/

import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface UserInfo {
  _id: string;        // Changed from 'id' to '_id'
  username: string;
}

interface UserContextType {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

// Create context with proper type and default value
export const UserContext = createContext<UserContextType>({
  userInfo: null,
  setUserInfo: () => {},
});

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};