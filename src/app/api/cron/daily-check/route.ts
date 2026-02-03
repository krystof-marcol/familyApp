import { NextResponse } from "next/server";
import webpush from "web-push";
import prisma from "@/lib/db";
import { PriorityType, Prisma } from "@prisma/client";

const NOTIFICATION_TEMPLATES = {
  EVENT_TODAY: {
    en: { title: "High priority event 🚨", body: "Today: {eventName}" },
    cz: { title: "Událost vysoké priority 🚨", body: "Dnes: {eventName}" },
  },
  EVENT_TOMORROW: {
    en: { title: "High priority event 🗓️", body: "Tomorrow: {eventName}" },
    cz: { title: "Událost vysoké priority 🗓️", body: "Zítra: {eventName}" },
  },
  DUTY_TODAY: {
    en: { title: "Chore Reminder 🧹", body: "Due today: {dutyName}" },
    cz: { title: "Připomínka úklidu 🧹", body: "Dnes splnit: {dutyName}" },
  },
};

function formatString(
  template: string,
  variables: Record<string, string | undefined>,
) {
  return template.replace(/{(\w+)}/g, (_, key) => variables[key] || "?");
}

webpush.setVapidDetails(
  "mailto:test@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function GET(request: Request) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  const [eventsToday, dutiesToday, urgentTomorrow] = await Promise.all([
    prisma.calendar.findMany({
      where: {
        dateTimeStart: { gte: todayStart, lte: todayEnd },
        priority: "HIGH" as PriorityType,
      },
      include: { users: true },
    }),
    prisma.homeDuty.findMany({
      where: { dueTo: { gte: todayStart, lte: todayEnd } },
      include: { users: true },
    }),
    prisma.calendar.findMany({
      where: {
        dateTimeStart: { gte: tomorrowStart, lte: tomorrowEnd },
        priority: "HIGH" as PriorityType,
      },
      include: { users: true },
    }),
  ]);

  const notifications: Promise<any>[] = [];

  for (const event of eventsToday) {
    for (const user of event.users) {
      if (user.pushSubscription && user.notifyCalendar) {
        const userLang = (user.language as "en" | "cz") || "en";
        const template = NOTIFICATION_TEMPLATES.EVENT_TODAY[userLang];

        const title = template.title;
        const body = formatString(template.body, {
          eventName: event.name,
          userName: event.name,
        });

        const payload = JSON.stringify({ title, body, url: "/" });

        notifications.push(
          sendNotificationToUser(user.id, user.pushSubscription, payload),
        );
      }
    }
  }

  for (const duty of dutiesToday) {
    for (const user of duty.users) {
      if (user.pushSubscription && user.notifyHomeDuty) {
        const userLang = (user.language as "en" | "cz") || "en";
        const template = NOTIFICATION_TEMPLATES.DUTY_TODAY[userLang];

        const title = template.title;
        const body = formatString(template.body, {
          dutyName: duty.name,
        });

        const payload = JSON.stringify({ title, body, url: "/" });

        notifications.push(
          sendNotificationToUser(user.id, user.pushSubscription, payload),
        );
      }
    }
  }

  for (const event of urgentTomorrow) {
    for (const user of event.users) {
      if (user.pushSubscription && user.notifyCalendar) {
        const userLang = (user.language as "en" | "cz") || "en";
        const template = NOTIFICATION_TEMPLATES.EVENT_TOMORROW[userLang];

        const timeString = new Date(event.dateTimeStart).toLocaleTimeString(
          userLang === "cz" ? "cs-CZ" : "en-GB",
          { hour: "2-digit", minute: "2-digit", timeZone: "UTC" },
        );

        const title = template.title;
        const body = formatString(template.body, {
          eventName: `${event.name} (${timeString})`,
          userName: event.name,
        });

        const payload = JSON.stringify({ title, body, url: "/calendar" });

        notifications.push(
          sendNotificationToUser(user.id, user.pushSubscription, payload),
        );
      }
    }
  }

  await Promise.allSettled(notifications);

  return NextResponse.json({
    success: true,
    checkedEventsToday: eventsToday.length,
    checkedDutiesToday: dutiesToday.length,
    checkedUrgentTomorrow: urgentTomorrow.length,
    notificationsSent: notifications.length,
  });
}

async function sendNotificationToUser(
  userId: string,
  subscription: any,
  payload: string,
) {
  try {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      payload,
    );
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log(`❌ Removing dead subscription for user ${userId}`);
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { pushSubscription: Prisma.DbNull },
        });
      } catch (dbError) {
        console.error("Failed to remove dead subscription", dbError);
      }
    } else {
      console.error(`❌ Failed to send to user ${userId}:`, error.message);
    }
  }
}
