import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

interface DealBook {
  id: string;
  title: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  isDeal: boolean;
  publicationYear: number;
  coverImage: string | null;
  author: {
    name: string;
  };
  publisher: {
    name: string;
  };
}

export default async function TodaysDealsPage() {
  const deals: DealBook[] = await prisma.book.findMany({
    where: { isDeal: true },
    include: {
      author: { select: { name: true } },
      publisher: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          🔥 Today&apos;s Deals & Discounts
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Special prices on selected eBooks. Limited-time offerings.
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No active deals right now.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Browse Full Catalog →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {deals.map((book: DealBook) => {
            const activePrice = book.discountPrice ?? book.price;

            return (
              <div
                key={book.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <Link href={`/books/${book.id}`}>
                    <img
                      src={
                        book.coverImage ||
                        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600"
                      }
                      alt={book.title}
                      className="w-full aspect-3/4 object-cover hover:opacity-90 transition"
                    />
                  </Link>
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Sale
                    </span>
                    <Link href={`/books/${book.id}`}>
                      <h3 className="font-bold text-gray-900 mt-2 hover:text-indigo-600 transition truncate">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{book.author.name}</p>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-gray-900">
                        ${activePrice.toFixed(2)}
                      </span>
                      {book.discountPrice && (
                        <span className="text-xs line-through text-gray-400">
                          ${book.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <AddToCartButton
                    book={{
                      id: book.id,
                      title: book.title,
                      price: activePrice,
                      coverImage: book.coverImage || "",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}