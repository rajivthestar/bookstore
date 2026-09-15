import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BookItem {
  id: string;
  title: string;
  price: number;
  coverImage: string;
}

interface CartStore {
  items: BookItem[];
  isOpen: boolean;
  addItem: (book: BookItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (book) => {
        if (!get().items.some((item) => item.id === book.id)) {
          set({ items: [...get().items, book] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      total: () => get().items.reduce((sum, item) => sum + item.price, 0),
    }),
    { name: "ebook-cart" }
  )
);