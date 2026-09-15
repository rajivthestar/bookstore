import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("q") || "";
  const author = searchParams.get("author");
  const publisher = searchParams.get("publisher");
  const genre = searchParams.get("genre");
  const series = searchParams.get("series");
  const year = searchParams.get("year");
  const isDeal = searchParams.get("isDeal") === "true";
  const sortBy = searchParams.get("sortBy") || "newest";

  // Dynamic filter query (inferred automatically)
  const where = {
    AND: [
      query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { author: { name: { contains: query, mode: "insensitive" as const } } },
              { series: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {},
      author ? { author: { name: { equals: author, mode: "insensitive" as const } } } : {},
      publisher ? { publisher: { name: { equals: publisher, mode: "insensitive" as const } } } : {},
      genre ? { genre: { name: { equals: genre, mode: "insensitive" as const } } } : {},
      series ? { series: { equals: series, mode: "insensitive" as const } } : {},
      year ? { publicationYear: parseInt(year, 10) } : {},
      isDeal ? { isDeal: true } : {},
    ],
  };

  // Dynamic Sorting
  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  switch (sortBy) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "year_asc":
      orderBy = { publicationYear: "asc" };
      break;
    case "year_desc":
      orderBy = { publicationYear: "desc" };
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  try {
    const books = await prisma.book.findMany({
      where,
      orderBy,
      include: {
        author: true,
        publisher: true,
        genre: true,
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}