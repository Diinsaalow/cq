import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, database, config } from '../lib/appwrite';
import { Models, ID, Query } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'admin' | 'user';

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: Models.User<Models.Preferences> | null;
  email: string | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserRole>;
  signup: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const user = await account.get();
        setCurrentUser(user);
        setEmail(user.email);
        // Fetch user doc from custom collection by authId
        const userDocs = await database.listDocuments(
          config.db,
          config.col.users,
          [Query.equal('authId', user.$id)]
        );
        if (userDocs.documents.length > 0) {
          setRole(userDocs.documents[0].role || 'user');
        } else {
          setRole('user');
        }
        setIsAuthenticated(true);
      } catch (err) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setEmail(null);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<UserRole> => {
    try {
      setLoading(true);
      setError(null);

      // First check if there's an active session and delete it
      try {
        const session = await account.getSession('current');
        if (session) {
          await account.deleteSession('current');
        }
      } catch (e) {
        // No active session, continue with login
      }

      // Create new session
      await account.createEmailPasswordSession(email, password);

      // Get user info
      const user = await account.get();
      setCurrentUser(user);
      setEmail(user.email);
      setIsAuthenticated(true);

      // Get user role from custom collection
      const userDocs = await database.listDocuments(
        config.db,
        config.col.users,
        [Query.equal('authId', user.$id)]
      );

      let userRole: UserRole = 'user';
      if (userDocs.documents.length > 0) {
        const userDoc = userDocs.documents[0];
        userRole = userDoc.role as UserRole;
        setRole(userRole);
      } else {
        setRole('user');
      }

      // Store the role in AsyncStorage for persistence
      await AsyncStorage.setItem('userRole', userRole);

      return userRole;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    userRole: UserRole = 'user'
  ) => {
    try {
      setLoading(true);
      setError(null);
      // 1. Try to create user in Appwrite Auth
      let authUser;
      try {
        authUser = await account.create(ID.unique(), email, password);
      } catch (err: any) {
        if (err && err.message && err.message.includes('already exists')) {
          throw new Error('Email already exists');
        }
        throw err;
      }
      // 2. Create user doc in custom collection with authId and email
      await database.createDocument(config.db, config.col.users, ID.unique(), {
        email,
        authId: authUser.$id,
        role: userRole,
      });
      setEmail(email);
      setRole(userRole);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setEmail(null);
      setRole('user');
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
        email,
        role,
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
