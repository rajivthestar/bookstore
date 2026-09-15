"use client";

import { useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    authorName: "",
    publisherName: "",
    genreName: "",
    publicationYear: new Date().getFullYear().toString(),
    series: "",
    price: "",
    discountPrice: "",
    isDeal: false,
    coverImage: "",
    fileUrl: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save book.");
      }

      setStatusMessage({ type: "success", text: `"${data.title}" was added successfully!` });
      setFormData({
        title: "",
        authorName: "",
        publisherName: "",
        genreName: "",
        publicationYear: new Date().getFullYear().toString(),
        series: "",
        price: "",
        discountPrice: "",
        isDeal: false,
        coverImage: "",
        fileUrl: "",
        description: "",
      });
    } catch (err: any) {
      console.error("Form submit error:", err);
      setStatusMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin: Add New eBook</h1>
        <p className="text-sm text-gray-500 mb-6">Enter book specifications to publish directly into the catalog.</p>

        {statusMessage && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm font-medium ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Book Title *</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="The Great Gatsby"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Author Name *</label>
              <input
                required
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                placeholder="F. Scott Fitzgerald"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Publisher *</label>
              <input
                required
                type="text"
                name="publisherName"
                value={formData.publisherName}
                onChange={handleChange}
                placeholder="Scribner"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Genre *</label>
              <input
                required
                type="text"
                name="genreName"
                value={formData.genreName}
                onChange={handleChange}
                placeholder="Classic Fiction"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Publication Year</label>
              <input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Series (Optional)</label>
              <input
                type="text"
                name="series"
                value={formData.series}
                onChange={handleChange}
                placeholder="Trilogy / Standalone"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Regular Price ($) *</label>
              <input
                required
                step="0.01"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="9.99"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Discount Price ($)</label>
              <input
                step="0.01"
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="4.99"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDeal"
              name="isDeal"
              checked={formData.isDeal}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 rounded"
            />
            <label htmlFor="isDeal" className="text-sm font-medium text-gray-700">
              Mark as &quot;Today&apos;s Deal&quot; (displays on Deals page and highlights price)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Cover Image URL</label>
              <input
                type="text"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">eBook Download File URL</label>
              <input
                type="text"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                placeholder="https://example.com/sample.pdf"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Summary and synopsis of the book..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Saving to Database..." : "Save Book to Catalog"}
          </button>
        </form>
      </div>
    </div>
  );
}