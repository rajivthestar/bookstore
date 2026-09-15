"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteBookButtonProps {
  bookId: string;
  bookTitle: string;
}

export default function DeleteBookButton({ bookId, bookTitle }: DeleteBookButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${bookTitle}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error || "Failed to delete book"}`);
        return;
      }

      // Revalidates server data on the current page
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("A network error occurred while deleting the book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-lg transition disabled:opacity-50 cursor-pointer"
      title="Delete book"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}