
import { useState, useEffect } from 'react';

export interface CartItem {
  bookId: string;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addItem = (bookId: string, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.bookId === bookId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += qty;
        return next;
      }
      return [...prev, { bookId, quantity: qty }];
    });
  };

  const removeItem = (bookId: string) =>
    setCart(prev => prev.filter(i => i.bookId !== bookId));

  const updateQty = (bookId: string, quantity: number) =>
    setCart(prev =>
      prev.map(i => (i.bookId === bookId ? { ...i, quantity } : i))
    );

  const clear = () => setCart([]);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return { cart, addItem, removeItem, updateQty, clear, totalItems };
}
