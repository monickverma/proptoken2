
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User, Wallet } from '../types';
import { INITIAL_WALLET } from '../constants';
import { api } from '../api';
import { db } from '../db';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session on load
  useEffect(() => {
    const session = db.getCurrentUser();
    if (session) {
      setUser(session);
      api.getWallet(session.email).then(setWallet);
    }
    setIsLoading(false);
  }, []);

  const connectWallet = async () => {
    if (!user) return;
    setIsConnecting(true);
    try {
      const mockAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      const updatedUser = await api.connectWallet(user.email, mockAddress);
      setUser(updatedUser);
    } finally {
      setIsConnecting(false);
    }
  };

  const signIn = async (email: string) => {
    const existingUser = await api.login(email);
    if (existingUser) {
      setUser(existingUser);
      const w = await api.getWallet(existingUser.email);
      setWallet(w);
    } else {
      throw new Error("Identity not found. Please register.");
    }
  };

  const signUp = async (email: string, name: string) => {
    const newUser = await api.register(name, email);
    setUser(newUser);
    const w = await api.getWallet(newUser.email);
    setWallet(w);
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
    setWallet(INITIAL_WALLET);
  };

  const buyTokens = async (assetId: string, amount: number) => {
    if (!user) return '';
    const result = await api.buyTokens(user.email, assetId, amount);
    setWallet(result.wallet);
    return result.txHash;
  };

  const swapToStablecoin = async (assetId: string, tokenAmount: number) => {
    if (!user) return '';
    const result = await api.swapToStable(user.email, assetId, tokenAmount);
    setWallet(result.wallet);
    return result.txHash;
  };

  const lockAsCollateral = async (assetId: string, tokenAmount: number) => {
    if (!user) return '';
    const result = await api.lockCollateral(user.email, assetId, tokenAmount);
    setWallet(result.wallet);
    return result.txHash;
  };

  const makePayment = async (amount: number): Promise<boolean> => {
    if (!user) return false;
    try {
      const result = await api.pay(user.email, amount);
      setWallet(result.wallet);
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ 
      user, wallet, isConnecting, connectWallet, signIn, signUp, signOut, 
      buyTokens, swapToStablecoin, lockAsCollateral, makePayment 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
