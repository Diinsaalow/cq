import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, database, config } from '../lib/appwrite';
import { Models, ID, Query } from 'react-native-appwrite';

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: Models.User<Models.Preferences> | null;
  username: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [username, setUsername] = useState<string | null>('Developer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        // Skip Appwrite check during development
        // const user = await account.get();
        // setCurrentUser(user);
        setIsAuthenticated(true);
        setUsername('Developer');
      } catch (err) {
        // User is not authenticated
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Find user in database
      const userList = await database.listDocuments(
        config.db,
        config.col.users,
        [Query.equal('username', username)]
      );

      if (userList.documents.length === 0) {
        throw new Error('User not found');
      }

      // Verify password
      const userData = userList.documents[0];
      if (userData.password !== password) {
        throw new Error('Invalid password');
      }

      // Set authenticated state
      setUsername(username);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if username already exists
      const existingUsers = await database.listDocuments(
        config.db,
        config.col.users,
        [Query.equal('username', username)]
      );

      if (existingUsers.documents.length > 0) {
        throw new Error('Username already exists');
      }

      // Create user in database
      const user = await database.createDocument(
        config.db,
        config.col.users,
        ID.unique(),
        {
          username,
          password,
        }
      );

      console.log('User: ', user);

      // Set authenticated state
      setUsername(username);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setUsername(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        username,
        loading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
