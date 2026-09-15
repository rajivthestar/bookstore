"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Book {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  isDeal: boolean;
  coverImage: string;
  publicationYear: number;
  series?: string;
  author: { name: string };
  publisher: { name: string };
  genre: { name: string };
}

function StorefrontContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sortBy") || "newest");
  const authorQuery = searchParams.get("author") || "";
  const publisherQuery = searchParams.get("publisher") || "";
  const genreQuery = searchParams.get("genre") || "";

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const res = await fetch(`/api/books?${params.toString()}`);
        const data = await res.json();

        // Ensure data is an array before setting state to avoid crashes
        if (Array.isArray(data)) {
          setBooks(data);
        } else {
          setBooks([]);
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar & Sort */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateFilters("q", search);
          }}
          className="w-full md:w-1/2 flex gap-2"
        >
          <input
            type="text"
            placeholder="Search by title, author, or series..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-indigo-500 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort By:</label>
          <select
            className="border px-3 py-2 rounded-lg bg-white w-full md:w-auto text-gray-700 font-medium"
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              updateFilters("sortBy", e.target.value);
            }}
          >
            <option value="newest">Newest Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="year_desc">Year: New to Old</option>
            <option value="year_asc">Year: Old to New</option>
            <option value="title_asc">Title: A-Z</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {(authorQuery || publisherQuery || genreQuery || searchParams.get("q")) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
          {authorQuery && (
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
              Author: {authorQuery}
              <button onClick={() => updateFilters("author", "")} className="ml-1 text-red-500 font-bold">×</button>
            </span>
          )}
          {publisherQuery && (
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
              Publisher: {publisherQuery}
              <button onClick={() => updateFilters("publisher", "")} className="ml-1 text-red-500 font-bold">×</button>
            </span>
          )}
          {genreQuery && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
              Genre: {genreQuery}
              <button onClick={() => updateFilters("genre", "")} className="ml-1 text-red-500 font-bold">×</button>
            </span>
          )}
          {searchParams.get("q") && (
            <span className="bg-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
              Keyword: {searchParams.get("q")}
              <button
                onClick={() => {
                  setSearch("");
                  updateFilters("q", "");
                }}
                className="ml-1 text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearch("");
              router.push("/");
            }}
            className="text-xs text-red-600 underline font-semibold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Book Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading catalog...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border border-dashed rounded-xl p-8">
          <p className="text-gray-500 font-medium">No books found matching criteria.</p>
          <Link href="/admin" className="text-indigo-600 font-semibold text-sm mt-2 inline-block hover:underline">
            Go to Admin Console to add your first book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="border rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <Link href={`/books/${book.id}`}>
                  <img
                    src={book.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400"}
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-lg mb-3 shadow-inner"
                  />
                  <h3 className="font-semibold text-gray-900 truncate hover:text-indigo-600">{book.title}</h3>
                </Link>
                <div className="flex flex-col gap-0.5 mt-1">
                  <Link
                    href={`/?author=${encodeURIComponent(book.author.name)}`}
                    className="text-xs text-gray-500 hover:text-indigo-600 hover:underline"
                  >
                    {book.author.name}
                  </Link>
                  <Link
                    href={`/?publisher=${encodeURIComponent(book.publisher.name)}`}
                    className="text-[11px] text-gray-400 hover:text-gray-600"
                  >
                    {book.publisher.name} • {book.publicationYear}
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">
                  ${(book.isDeal && book.discountPrice ? book.discountPrice : book.price).toFixed(2)}
                </span>
                {book.isDeal && (
                  <span className="bg-red-50 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                    DEAL
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Storefront() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading storefront...</div>}>
      <StorefrontContent />
    </Suspense>
  );
}