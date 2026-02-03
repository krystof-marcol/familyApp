import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const familyId = searchParams.get("familyId");

  if (!familyId) return new NextResponse("Family ID required", { status: 400 });

  const items = await db.calendar.findMany({
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
      dateTimeStart,
      dateTimeEnd,
      description,
      color,
      userIds,
      familyId,
      recurrence,
      priority,
    } = body;

    const newEvent = await db.calendar.create({
      data: {
        id,
        name,
        dateTimeStart,
        dateTimeEnd,
        description,
        color,
        familyId,
        recurrence,
        priority,
        users: {
          connect: userIds.map((userId: string) => ({ id: userId })),
        },
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

    if (!id) return new NextResponse("Missing ID", { status: 400 });

    const updatedEvent = await db.calendar.update({
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
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("Missing ID", { status: 400 });

    await db.calendar.delete({
      where: { id: id },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
