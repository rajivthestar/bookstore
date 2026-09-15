import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      author: true,
      publisher: true,
      genre: true,
    },
  });

  if (!book) {
    notFound();
  }

  const activePrice = book.isDeal && book.discountPrice ? book.discountPrice : book.price;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 mb-8"
      >
        ← Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-white border border-gray-200 rounded-2xl p-6 md:p-10 shadow-sm">
        {/* Cover Column */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src={book.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600"}
            alt={book.title}
            className="w-full max-w-sm rounded-xl shadow-md object-cover aspect-3/4"
          />
          {book.isDeal && (
            <span className="mt-4 inline-block bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              🔥 Featured Deal
            </span>
          )}
        </div>

        {/* Book Details Column */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                {book.genre.name}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{book.title}</h1>
              <p className="text-base text-gray-600 mt-1">
                By{" "}
                <Link
                  href={`/?author=${encodeURIComponent(book.author.name)}`}
                  className="font-semibold text-gray-900 hover:text-indigo-600 underline"
                >
                  {book.author.name}
                </Link>
              </p>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-3 py-2 border-y border-gray-100">
              <span className="text-3xl font-extrabold text-gray-900">
                ${activePrice.toFixed(2)}
              </span>
              {book.isDeal && book.discountPrice && (
                <span className="text-base line-through text-gray-400">
                  ${book.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Meta Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-600 pt-2">
              <div>
                <span className="block text-gray-400 font-medium uppercase">Publisher</span>
                <span className="font-semibold text-gray-800">{book.publisher.name}</span>
              </div>
              <div>
                <span className="block text-gray-400 font-medium uppercase">Year</span>
                <span className="font-semibold text-gray-800">{book.publicationYear}</span>
              </div>
              {book.series && (
                <div>
                  <span className="block text-gray-400 font-medium uppercase">Series</span>
                  <span className="font-semibold text-gray-800">{book.series}</span>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div className="pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">
                About this eBook
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {book.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-1/2">
              <AddToCartButton
                book={{
                  id: book.id,
                  title: book.title,
                  price: activePrice,
                  coverImage: book.coverImage || "",
                }}
              />
            </div>
            {book.fileUrl && (
              <a
                href={book.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg text-sm font-semibold transition"
              >
                Sample Preview (PDF)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}