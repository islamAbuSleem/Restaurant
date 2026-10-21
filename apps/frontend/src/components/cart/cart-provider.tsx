"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartEntry = {
  menuItemId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
};

type CartContextValue = {
  entries: CartEntry[];
  count: number;
  totalCents: number;
  addItem: (item: Omit<CartEntry, "quantity">, quantity?: number) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clear: () => void;
  hydrated: boolean;
};

const STORAGE_KEY = "ember-oak-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setEntries(parsed as CartEntry[]);
        }
      }
    } catch {
      // Ignore malformed cart payloads.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, hydrated]);

  const addItem = useCallback((item: Omit<CartEntry, "quantity">, quantity = 1) => {
    setEntries((current) => {
      const existing = current.find((entry) => entry.menuItemId === item.menuItemId);
      if (existing) {
        return current.map((entry) =>
          entry.menuItemId === item.menuItemId
            ? { ...entry, quantity: Math.min(99, entry.quantity + quantity) }
            : entry,
        );
      }
      return [...current, { ...item, quantity }];
    });
  }, []);

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setEntries((current) =>
      quantity <= 0
        ? current.filter((entry) => entry.menuItemId !== menuItemId)
        : current.map((entry) =>
            entry.menuItemId === menuItemId
              ? { ...entry, quantity: Math.min(99, quantity) }
              : entry,
          ),
    );
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setEntries((current) => current.filter((entry) => entry.menuItemId !== menuItemId));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalCents = entries.reduce((sum, entry) => sum + entry.priceCents * entry.quantity, 0);
    return { entries, count, totalCents, addItem, setQuantity, removeItem, clear, hydrated };
  }, [entries, addItem, setQuantity, removeItem, clear, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
