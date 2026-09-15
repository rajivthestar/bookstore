"use client";

import { useCartStore } from "@/lib/store";
import { X, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, total } = useCartStore();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout error. Please verify your Stripe setup in the backend.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Your Cart ({items.length})</h2>
          <button onClick={toggleCart} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-20">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                <img
                  src={item.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200"}
                  alt={item.title}
                  className="w-16 h-20 object-cover rounded shadow-xs"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                  <p className="text-indigo-600 font-bold text-sm mt-1">${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 space-y-4">
          <div className="flex justify-between items-center text-base font-bold text-gray-900">
            <span>Total:</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <button
            disabled={items.length === 0 || loading}
            onClick={handleCheckout}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Redirecting..." : "Checkout with Stripe"}
          </button>
        </div>
      </div>
    </div>
  );
}