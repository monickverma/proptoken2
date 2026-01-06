
import { User, Wallet, Asset, ActionHistory } from './types';
import { INITIAL_WALLET, DUMMY_ASSETS } from './constants';

const DB_KEYS = {
  USERS: 'proptoken_users',
  WALLETS: 'proptoken_wallets',
  CURRENT_USER: 'proptoken_session'
};

class Database {
  private static instance: Database;

  private constructor() {
    this.init();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private init() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.WALLETS)) {
      localStorage.setItem(DB_KEYS.WALLETS, JSON.stringify({}));
    }
  }

  // User Operations
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  }

  saveUser(user: User) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    
    // Initialize wallet for new user
    const wallets = this.getWallets();
    wallets[user.email] = { ...INITIAL_WALLET };
    localStorage.setItem(DB_KEYS.WALLETS, JSON.stringify(wallets));
  }

  updateUser(email: string, updates: Partial<User>) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      
      // Also update current session if it's the same user
      const current = this.getCurrentUser();
      if (current && current.email === email) {
        this.setCurrentUser(users[index]);
      }
    }
  }

  // Wallet Operations
  getWallets(): Record<string, Wallet> {
    return JSON.parse(localStorage.getItem(DB_KEYS.WALLETS) || '{}');
  }

  getWallet(email: string): Wallet {
    const wallets = this.getWallets();
    return wallets[email] || { ...INITIAL_WALLET };
  }

  updateWallet(email: string, wallet: Wallet) {
    const wallets = this.getWallets();
    wallets[email] = wallet;
    localStorage.setItem(DB_KEYS.WALLETS, JSON.stringify(wallets));
  }

  // Session Operations
  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }
}

export const db = Database.getInstance();
