"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLanguageCookie(lang: string) {
  const cookieStore = await cookies();

  cookieStore.set("NEXT_LOCALE", lang, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 365, // 1 rok
    path: "/",
  });

  revalidatePath("/");
}
