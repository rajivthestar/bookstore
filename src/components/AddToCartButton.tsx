"use client";

import { useCartStore, BookItem } from "@/lib/store";
import { useState } from "react";

interface AddToCartButtonProps {
  book: BookItem;
}

export default function AddToCartButton({ book }: AddToCartButtonProps) {
  const { addItem, toggleCart } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(book);
    setIsAdded(true);

    // Optional: automatically open the cart drawer when clicked
    // toggleCart();

    // Revert button text back after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
        isAdded
          ? "bg-emerald-600 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
      }`}
    >
      {isAdded ? "✓ Added to Cart" : "Add to Cart"}
    </button>
  );
}