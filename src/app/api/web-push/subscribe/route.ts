import { NextResponse } from "next/server";
import webpush from "web-push";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

const NOTIFICATION_TEMPLATES = {
  SUBSCRIPTION_ADDED: {
    en: {
      title: "Notifications Enabled! ✅",
      body: "You will now be notified when family adds items.",
    },
    cz: {
      title: "Upozornění zapnuta! ✅",
      body: "Nyní budete upozorněni, když rodina přidá položky.",
    },
  },
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  const userLang = (session?.user?.language as "en" | "cz") || "en";

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscription, url } = await request.json();
  if (!subscription) {
    return NextResponse.json(
      { error: "Missing subscription" },
      { status: 400 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: subscription,
      },
    });
  } catch (dbError) {
    console.error("❌ Database Error: Failed to save subscription", dbError);
    return NextResponse.json(
      { error: "Database update failed" },
      { status: 500 },
    );
  }

  if (
    !process.env.VAPID_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  ) {
    console.error("❌ ERROR: VAPID Keys are missing in .env file!");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  try {
    webpush.setVapidDetails(
      "mailto:test@example.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
  } catch (err) {
    console.error("❌ ERROR setting VAPID details:", err);
    return NextResponse.json({ error: "VAPID Setup Failed" }, { status: 500 });
  }

  const template =
    NOTIFICATION_TEMPLATES.SUBSCRIPTION_ADDED[userLang] ||
    NOTIFICATION_TEMPLATES.SUBSCRIPTION_ADDED.en;

  const payload = JSON.stringify({
    title: template.title,
    body: template.body,
    url: "/calendar",
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("------------------------------------------");
    console.error("❌ FAILED to send notification:");
    console.error("Status Code:", error.statusCode);
    console.error("Message:", error.body || error.message);

    if (error.statusCode === 410 || error.statusCode === 404) {
      console.error("💡 Subscription is dead. Removing from DB...");
      await prisma.user.update({
        where: { id: session.user.id },
        data: { pushSubscription: Prisma.DbNull },
      });
    }

    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
