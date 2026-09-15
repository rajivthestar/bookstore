import prisma from "@/lib/prisma";
import Link from "next/link";

interface DealBook {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  coverImage: string;
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
    include: { author: true, publisher: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-red-600 flex items-center gap-2">
          🔥 Today&apos;s Deals
        </h1>
        <p className="text-gray-500 text-sm">Special discounts available today only.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {deals.map((book: DealBook) => (
          <div
            key={book.id}
            className="border border-red-200 rounded-lg p-4 bg-red-50/20 shadow-sm flex flex-col justify-between"
          >
            <Link href={`/books/${book.id}`}>
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-64 object-cover rounded mb-3"
              />
              <h3 className="font-bold text-gray-900 truncate">{book.title}</h3>
            </Link>
            <p className="text-xs text-gray-500">By {book.author.name}</p>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-red-600">
                  ${book.discountPrice?.toFixed(2)}
                </span>
                <span className="text-xs line-through text-gray-400 ml-2">
                  ${book.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}