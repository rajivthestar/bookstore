import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteBookButton from "@/components/DeleteBookButton";

export const dynamic = "force-dynamic";

interface AdminBook {
  id: string;
  title: string;
  publicationYear: number;
  price: number;
  discountPrice: number | null;
  isDeal: boolean;
  coverImage: string | null;
  author: { name: string };
  publisher: { name: string };
  genre: { name: string };
}

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

async function createBook(formData: FormData) {
  "use server";

  const title = (formData.get("title") as string)?.trim();
  const authorName = (formData.get("author") as string)?.trim();
  const genreName = (formData.get("genre") as string)?.trim();
  const publisherName = (formData.get("publisher") as string)?.trim() || "Independent";
  const price = parseFloat(formData.get("price") as string) || 0;
  const discountPriceRaw = formData.get("discountPrice") as string;
  const discountPrice = discountPriceRaw ? parseFloat(discountPriceRaw) : null;
  const isDeal = formData.get("isDeal") === "on";
  const publicationYear =
    parseInt(formData.get("publicationYear") as string, 10) || new Date().getFullYear();
  const series = (formData.get("series") as string)?.trim() || null;
  const coverImage = (formData.get("coverImage") as string)?.trim() || null;
  const fileUrl = (formData.get("fileUrl") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!title || !authorName || !genreName) {
    return;
  }

  // Connect or create Author
  let author = await prisma.author.findFirst({ where: { name: authorName } });
  if (!author) {
    author = await prisma.author.create({ data: { name: authorName } });
  }

  // Connect or create Genre
  let genre = await prisma.genre.findFirst({ where: { name: genreName } });
  if (!genre) {
    genre = await prisma.genre.create({ data: { name: genreName } });
  }

  // Connect or create Publisher
  let publisher = await prisma.publisher.findFirst({ where: { name: publisherName } });
  if (!publisher) {
    publisher = await prisma.publisher.create({ data: { name: publisherName } });
  }

  // Create Book
  await prisma.book.create({
    data: {
      title,
      description,
      price,
      discountPrice,
      isDeal,
      publicationYear,
      series,
      coverImage,
      fileUrl,
      authorId: author.id,
      genreId: genre.id,
      publisherId: publisher.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/deals");
}

export default async function AdminPage() {
  const books: AdminBook[] = await prisma.book.findMany({
    include: {
      author: { select: { name: true } },
      genre: { select: { name: true } },
      publisher: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeDealsCount = books.filter((b: AdminBook) => b.isDeal).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Management
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create new book listings, configure discount deals, and manage catalog inventory.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            View Storefront →
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-lg transition shadow-2xs cursor-pointer"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Titles</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{books.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Deals</p>
          <p className="text-3xl font-extrabold text-red-600 mt-2">{activeDealsCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Database Status</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700">Neon Connected</span>
          </div>
        </div>
      </div>

      {/* Create New Book Form */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/60">
          <h2 className="text-lg font-bold text-gray-900">Add New eBook</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Authors, genres, and publishers are linked automatically or created if they don&apos;t exist.
          </p>
        </div>

        <form action={createBook} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Book Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Atomic Habits"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Author *
              </label>
              <input
                type="text"
                name="author"
                required
                placeholder="e.g. James Clear"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Genre *
              </label>
              <input
                type="text"
                name="genre"
                required
                placeholder="e.g. Self-Help / Psychology"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                placeholder="e.g. Penguin Random House"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Publication Year
              </label>
              <input
                type="number"
                name="publicationYear"
                defaultValue={new Date().getFullYear()}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Regular Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                required
                placeholder="19.99"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Deal / Discount Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="discountPrice"
                placeholder="9.99 (optional)"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Series (Optional)
              </label>
              <input
                type="text"
                name="series"
                placeholder="e.g. Book 1 of 3"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                name="coverImage"
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                eBook File Download URL
              </label>
              <input
                type="url"
                name="fileUrl"
                placeholder="https://storage.../book.pdf"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Book Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief summary or marketing copy for this eBook..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isDeal"
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-gray-800">
                Mark as Active Deal (Show on Deals Page)
              </span>
            </label>

            <button
              type="submit"
              className="inline-flex justify-center items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition cursor-pointer"
            >
              Add Book to Catalog
            </button>
          </div>
        </form>
      </div>

      {/* Inventory Management Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Current Catalog ({books.length})</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live inventory synced with Neon PostgreSQL.
            </p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-base font-semibold">No books in catalog yet.</p>
            <p className="text-xs mt-1">Use the form above to add your first title.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-6">Book</th>
                  <th className="py-3.5 px-6">Author & Publisher</th>
                  <th className="py-3.5 px-6">Genre</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book: AdminBook) => {
                  return (
                    <tr key={book.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              book.coverImage ||
                              "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100"
                            }
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-xs">{book.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{book.publicationYear}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-800">{book.author.name}</p>
                        <p className="text-xs text-gray-400">{book.publisher.name}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                          {book.genre.name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-gray-900">
                            ${(book.discountPrice ?? book.price).toFixed(2)}
                          </span>
                          {book.discountPrice && (
                            <span className="text-xs line-through text-gray-400">
                              ${book.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {book.isDeal && (
                          <span className="inline-block text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-1.5 py-0.5 rounded mt-1">
                            Sale Deal
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}