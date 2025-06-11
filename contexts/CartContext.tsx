'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartState, CartItem, Product } from '@/types/product';

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, selectedVariants: { [key: string]: string }, quantity?: number) => void;
  removeFromCart: (productId: string, selectedVariants: { [key: string]: string }) => void;
  updateQuantity: (productId: string, selectedVariants: { [key: string]: string }, quantity: number) => void;
  clearCart: () => void;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; selectedVariants: { [key: string]: string }; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; selectedVariants: { [key: string]: string } } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; selectedVariants: { [key: string]: string }; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

function calculatePrice(product: Product, selectedVariants: { [key: string]: string }): number {
  let price = product.basePrice;
  
  Object.entries(selectedVariants).forEach(([optionName, variantId]) => {
    const variant = product.variants[optionName]?.find(v => v.id === variantId);
    if (variant) {
      price = variant.price;
    }
  });
  
  return price;
}

function getCartItemKey(productId: string, selectedVariants: { [key: string]: string }): string {
  return `${productId}-${JSON.stringify(selectedVariants)}`;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, selectedVariants, quantity } = action.payload;
      const price = calculatePrice(product, selectedVariants);
      const itemKey = getCartItemKey(product.id, selectedVariants);
      
      const existingItemIndex = state.items.findIndex(item => 
        getCartItemKey(item.productId, item.selectedVariants) === itemKey
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        const newItem: CartItem = {
          productId: product.id,
          product,
          selectedVariants,
          quantity,
          price,
        };
        newItems = [...state.items, newItem];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { items: newItems, total, itemCount };
    }
    
    case 'REMOVE_FROM_CART': {
      const { productId, selectedVariants } = action.payload;
      const itemKey = getCartItemKey(productId, selectedVariants);
      
      const newItems = state.items.filter(item => 
        getCartItemKey(item.productId, item.selectedVariants) !== itemKey
      );
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { items: newItems, total, itemCount };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, selectedVariants, quantity } = action.payload;
      const itemKey = getCartItemKey(productId, selectedVariants);
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { productId, selectedVariants } });
      }
      
      const newItems = state.items.map(item => {
        if (getCartItemKey(item.productId, item.selectedVariants) === itemKey) {
          return { ...item, quantity };
        }
        return item;
      });
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { items: newItems, total, itemCount };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    case 'LOAD_CART':
      return action.payload;
    
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch {
        // Invalid cart data, ignore
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);
  
  const addToCart = (product: Product, selectedVariants: { [key: string]: string }, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, selectedVariants, quantity } });
  };
  
  const removeFromCart = (productId: string, selectedVariants: { [key: string]: string }) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, selectedVariants } });
  };
  
  const updateQuantity = (productId: string, selectedVariants: { [key: string]: string }, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, selectedVariants, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}