import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const familyId = searchParams.get("familyId");

  if (!familyId) return new NextResponse("Family ID required", { status: 400 });

  const items = await db.expense.findMany({
    where: {
      familyId: familyId,
    },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await request.json();
    const {
      id,
      name,
      amount,
      currency,
      date,
      note,
      category,
      familyId,
      userId,
    } = body;
    const newEvent = await db.expense.create({
      data: {
        id,
        name,
        amount,
        currency,
        date,
        note,
        category,
        familyId,
        userId,
      },
    });
    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("POST Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return new NextResponse("Missing ID", { status: 500 });

    const updatedEvent = await db.expense.update({
      where: { id: id },
      data: {
        ...data,
      },
    });
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("PUT Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("Missing ID", { status: 400 });

    await db.expense.delete({
      where: { id: id },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
