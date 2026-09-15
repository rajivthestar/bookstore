import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Book deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Delete Book Error:", error);

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete this book because it is linked to completed orders." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete book" },
      { status: 500 }
    );
  }
}