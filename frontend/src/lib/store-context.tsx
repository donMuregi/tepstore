'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Cart, User, cartAPI, authAPI } from '@/lib/api';

interface StoreContextType {
  // Cart
  cart: Cart | null;
  cartLoading: boolean;
  addToCart: (productId: number, variantId?: number, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      authAPI.getUser(savedToken)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Load cart
  const refreshCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const savedToken = localStorage.getItem('token');
      const cartData = await cartAPI.get(savedToken || undefined);
      setCart(cartData);
    } catch {
      // Cart might not exist yet, that's fine
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, variantId?: number, quantity = 1) => {
    const savedToken = localStorage.getItem('token');
    const updatedCart = await cartAPI.addItem(productId, variantId, quantity, savedToken || undefined);
    setCart(updatedCart);
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    const savedToken = localStorage.getItem('token');
    const updatedCart = await cartAPI.updateItem(itemId, quantity, savedToken || undefined);
    setCart(updatedCart);
  };

  const removeFromCart = async (itemId: number) => {
    const savedToken = localStorage.getItem('token');
    const updatedCart = await cartAPI.removeItem(itemId, savedToken || undefined);
    setCart(updatedCart);
  };

  const clearCart = async () => {
    const savedToken = localStorage.getItem('token');
    await cartAPI.clear(savedToken || undefined);
    setCart(null);
  };

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    // Refresh cart after login to get merged cart items
    await refreshCart();
  };

  const register = async (data: Record<string, unknown>) => {
    const response = await authAPI.register(data);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
  };

  const logout = async () => {
    if (token) {
      try {
        await authAPI.logout(token);
      } catch {
        // Ignore logout errors
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
        user,
        token,
        isAuthenticated: !!user,
        authLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
