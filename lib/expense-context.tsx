'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { auth, db, googleProvider, isFirebaseInitialized } from './firebase';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer';
export type Category = 'Food' | 'Transport' | 'Shopping' | 'Utilities' | 'Entertainment' | 'Health' | 'Education' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  method: PaymentMethod;
  date: string; // ISO string
  note: string;
}

export interface UserSettings {
  budgetLimit: number;
  currency: string;
  whatsappNumber: string;
  name: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  resetData: () => Promise<void>;
  isDemoMode: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  budgetLimit: 5000,
  currency: '₹',
  whatsappNumber: '',
  name: 'User',
};

// Mock initial data for demo mode
const DEMO_EXPENSES: Expense[] = [
  {
    id: '1',
    amount: 150,
    category: 'Food',
    method: 'UPI',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    note: 'Lunch at cafe',
  },
  {
    id: '2',
    amount: 2000,
    category: 'Shopping',
    method: 'Credit Card',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    note: 'Groceries',
  },
];

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = !isFirebaseInitialized;

  // Initialize Auth (Firebase or Local)
  useEffect(() => {
    if (isFirebaseInitialized && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) {
          setExpenses([]);
          setSettings(DEFAULT_SETTINGS);
          setIsLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      // Demo Mode Auth
      const storedAuth = localStorage.getItem('isAuthenticated');
      if (storedAuth === 'true') {
        // Mock user object
        setUser({ 
          uid: 'demo-user', 
          displayName: 'Demo User',
          email: 'demo@example.com',
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          photoURL: null,
          providerId: 'demo',
        } as unknown as User);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch Data (Firestore or LocalStorage)
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    if (isFirebaseInitialized && db) {
      // --- FIREBASE MODE ---
      const expensesQuery = query(
        collection(db, 'users', user.uid, 'expenses'),
        orderBy('date', 'desc')
      );

      const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
        const newExpenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];
        setExpenses(newExpenses);
      });

      const settingsRef = doc(db, 'users', user.uid, 'settings', 'config');
      const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as UserSettings);
        } else {
          setDoc(settingsRef, { ...DEFAULT_SETTINGS, name: user.displayName || 'User' });
        }
        setIsLoading(false);
      });

      return () => {
        unsubscribeExpenses();
        unsubscribeSettings();
      };
    } else {
      // --- DEMO MODE (LocalStorage) ---
      try {
        const storedExpenses = localStorage.getItem('expenses');
        const storedSettings = localStorage.getItem('settings');

        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
        } else {
          setExpenses(DEMO_EXPENSES);
        }

        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('Failed to load local data', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  // Sync to LocalStorage in Demo Mode
  useEffect(() => {
    if (isDemoMode && user) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  }, [expenses, settings, user, isDemoMode]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    
    if (isFirebaseInitialized && db) {
      await addDoc(collection(db, 'users', user.uid, 'expenses'), expense);
    } else {
      const newExpense = { ...expense, id: uuidv4() };
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const removeExpense = async (id: string) => {
    if (!user) return;

    if (isFirebaseInitialized && db) {
      await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    if (isFirebaseInitialized && db) {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'config');
      await setDoc(settingsRef, { ...settings, ...newSettings }, { merge: true });
    } else {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    }
  };

  const login = async () => {
    if (isFirebaseInitialized && auth && googleProvider) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Login failed", error);
        throw error;
      }
    } else {
      // Demo Login
      setUser({ 
        uid: 'demo-user', 
        displayName: 'Demo User',
        email: 'demo@example.com'
      } as unknown as User);
      localStorage.setItem('isAuthenticated', 'true');
    }
  };

  const logout = async () => {
    if (isFirebaseInitialized && auth) {
      await signOut(auth);
    } else {
      // Demo Logout
      setUser(null);
      localStorage.setItem('isAuthenticated', 'false');
    }
  };

  const resetData = async () => {
    if (!user) return;
    
    if (isFirebaseInitialized && db) {
      const expensesRef = collection(db, 'users', user.uid, 'expenses');
      const deletePromises = expenses.map(exp => deleteDoc(doc(db!, 'users', user.uid, 'expenses', exp.id)));
      await Promise.all(deletePromises);
      
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'config');
      await setDoc(settingsRef, DEFAULT_SETTINGS);
    } else {
      setExpenses([]);
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('expenses');
      localStorage.removeItem('settings');
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        removeExpense,
        settings,
        updateSettings,
        user,
        login,
        logout,
        isLoading,
        resetData,
        isDemoMode,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
