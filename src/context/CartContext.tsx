import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, Product } from '../types';
import { cartApi } from '../api/client';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      // Local storage fallback for unauthenticated guest browsing
      const local = localStorage.getItem('apex_guest_cart');
      if (local) {
        try {
          setCart(JSON.parse(local));
        } catch {
          setCart(null);
        }
      } else {
        setCart(null);
      }
      return;
    }

    try {
      setIsLoading(true);
      const serverCart = await cartApi.getCart();
      setCart(serverCart);
    } catch (err) {
      console.warn('Could not fetch cart from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const updatedCart = await cartApi.addItem(product.id, quantity);
        setCart(updatedCart);
      } catch (err: any) {
        console.error('Error adding to cart:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest local cart
      const currentItems = cart?.items ? [...cart.items] : [];
      const existing = currentItems.find(i => i.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        currentItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
        });
      }
      const totalAmount = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCart: Cart = {
        userId: 'guest',
        items: currentItems,
        totalAmount,
        updatedAt: Date.now(),
      };
      setCart(newCart);
      localStorage.setItem('apex_guest_cart', JSON.stringify(newCart));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const updatedCart = await cartApi.updateQuantity(productId, quantity);
        setCart(updatedCart);
      } catch (err) {
        console.error('Error updating quantity:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!cart) return;
      const currentItems = cart.items
        .map(i => (i.productId === productId ? { ...i, quantity } : i))
        .filter(i => i.quantity > 0);
      const totalAmount = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCart: Cart = { ...cart, items: currentItems, totalAmount };
      setCart(newCart);
      localStorage.setItem('apex_guest_cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const updatedCart = await cartApi.removeItem(productId);
        setCart(updatedCart);
      } catch (err) {
        console.error('Error removing item:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!cart) return;
      const currentItems = cart.items.filter(i => i.productId !== productId);
      const totalAmount = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newCart: Cart = { ...cart, items: currentItems, totalAmount };
      setCart(newCart);
      localStorage.setItem('apex_guest_cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        await cartApi.clear();
        setCart({ userId: '', items: [], totalAmount: 0 });
      } catch (err) {
        console.error('Error clearing cart:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCart(null);
      localStorage.removeItem('apex_guest_cart');
    }
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
