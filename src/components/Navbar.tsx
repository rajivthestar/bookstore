"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { ShoppingCart, Flame, ShieldAlert, BookMarked } from "lucide-react";

export default function Navbar() {
  const { items, toggleCart } = useCartStore();

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-indigo-600 font-extrabold text-xl">
          <BookMarked className="w-6 h-6" />
          <span>eBookStore</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-gray-600 hover:text-indigo-600">
            Catalog
          </Link>
          <Link
            href="/deals"
            className="text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
          >
            <Flame className="w-4 h-4" />
            Today&apos;s Deals
          </Link>
          <Link
            href="/admin"
            className="text-gray-600 hover:text-indigo-600 flex items-center gap-1"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin
          </Link>
        </nav>

        <button
          onClick={toggleCart}
          className="relative flex items-center bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition"
        >
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}