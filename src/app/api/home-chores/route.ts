import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const familyId = searchParams.get("familyId");

  if (!familyId) return new NextResponse("Family ID required", { status: 400 });

  const items = await db.homeDuty.findMany({
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
      familyId,
      description,
      userIds,
      assignTo,
      recurrence,
      dueTo,
    } = body;
    const newEvent = await db.homeDuty.create({
      data: {
        id,
        name,
        description,
        familyId,
        recurrence,
        dueTo,
        assignTo,
        users: {
          connect: [{ id: userIds[0] }],
        },
      },
    });
    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("POST Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
