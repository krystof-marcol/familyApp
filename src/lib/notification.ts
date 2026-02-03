"use server";

import webpush from "web-push";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

const NOTIFICATION_TEMPLATES = {
  EVENT_CREATED: {
    en: {
      title: "New Event: ",
      body: "{userName} added: {eventName}",
    },
    cz: {
      title: "Nová událost: ",
      body: "{userName} přidal: {eventName}",
    },
  },
};

const CATEGORY_TEMPLATES = {
  calendar: {
    en: "Calendar",
    cz: "Kalendář",
  },
  shopList: {
    en: "Shop List",
    cz: "Nákupní seznam",
  },
  homeDuty: {
    en: "Home chores",
    cz: "Domácí povinnosti",
  },
  expenses: {
    en: "Expenses",
    cz: "Výdaje",
  },
};

interface NotificationPayload {
  familyId: string;
  excludeUserId: string;
  type: keyof typeof NOTIFICATION_TEMPLATES;
  typeCategory: keyof typeof CATEGORY_TEMPLATES;
  variables: {
    userName: string;
    eventName?: string;
    [key: string]: string | undefined;
  };
  url: string;
}

function formatString(
  template: string,
  variables: Record<string, string | undefined>,
) {
  return template.replace(/{(\w+)}/g, (_, key) => variables[key] || "?");
}

export async function sendFamilyNotification({
  familyId,
  excludeUserId,
  type,
  typeCategory,
  variables,
  url,
}: NotificationPayload) {
  const recipients = await prisma.user.findMany({
    where: {
      familyId: familyId,
      id: { not: excludeUserId },
      pushSubscription: { not: Prisma.DbNull },
    },
    select: {
      id: true,
      pushSubscription: true,
      notifyCalendar: true,
      notifyExpenses: true,
      notifyShopList: true,
      notifyHomeDuty: true,
      notification: true,
      language: true,
    },
  });

  const notifications = recipients.map(async (user) => {
    try {
      const userLang = (user.language as "en" | "cz") || "en";
      let name = "notify" + typeCategory;
      name = name.slice(0, 6) + name[6].toUpperCase() + name.slice(7);
      const approve = user[name as keyof typeof user];

      if (!approve || !user.notification) {
        return;
      }

      const template =
        NOTIFICATION_TEMPLATES[type][userLang] ||
        NOTIFICATION_TEMPLATES[type]["en"];

      const templateCategory =
        CATEGORY_TEMPLATES[typeCategory][userLang] ||
        CATEGORY_TEMPLATES[typeCategory]["en"];

      const translatedTitle = template.title;
      const translatedBody = formatString(template.body, variables);
      const finalTitle = translatedTitle + templateCategory;

      const sub = user.pushSubscription as any;

      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: finalTitle,
          body: translatedBody,
          url,
        }),
      );
    } catch (error: any) {
      if (error.statusCode === 410) {
        console.log(`❌ removing dead subscription for user ${user.id}`);
        await prisma.user.update({
          where: { id: user.id },
          data: { pushSubscription: Prisma.DbNull },
        });
      }
    }
  });

  await Promise.all(notifications);
}
