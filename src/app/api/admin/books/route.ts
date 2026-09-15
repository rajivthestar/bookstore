import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both naming conventions gracefully
    const title = body.title?.trim();
    const description = body.description?.trim() || "";
    const authorName = (body.authorName || body.author)?.trim();
    const publisherName = (body.publisherName || body.publisher)?.trim();
    const genreName = (body.genreName || body.genre)?.trim();
    const series = body.series?.trim() || null;
    const coverImage = body.coverImage?.trim() || "";
    const fileUrl = body.fileUrl?.trim() || "";
    const price = parseFloat(body.price);
    const discountPrice = body.discountPrice ? parseFloat(body.discountPrice) : null;
    const isDeal = Boolean(body.isDeal);
    const publicationYear = parseInt(body.publicationYear, 10) || new Date().getFullYear();

    if (!title || !authorName || !publisherName || !genreName || isNaN(price)) {
      return NextResponse.json(
        { error: "Title, Author, Publisher, Genre, and valid Price are required." },
        { status: 400 }
      );
    }

    const newBook = await prisma.book.create({
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
        author: {
          connectOrCreate: {
            where: { name: authorName },
            create: { name: authorName },
          },
        },
        publisher: {
          connectOrCreate: {
            where: { name: publisherName },
            create: { name: publisherName },
          },
        },
        genre: {
          connectOrCreate: {
            where: { name: genreName },
            create: { name: genreName },
          },
        },
      },
      include: {
        author: true,
        publisher: true,
        genre: true,
      },
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error: any) {
    console.error("Database error in /api/admin/books:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create book in database" },
      { status: 500 }
    );
  }
}