import NextAuth, { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      familyId?: string;
      role: Role;
      language?: string;
      colorTheme?: string;
      notification?: boolean;
      notifyCalendar: boolean;
      notifyShopList: boolean;
      notifyHomeDuty: boolean;
      notifyExpenses: boolean;
      imageUrl?: string | null;
      provider?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    familyId?: string;
    role: Role;
    language?: string;
    colorTheme?: string;
    notification?: boolean;
    notifyCalendar: boolean;
    notifyShopList: boolean;
    notifyHomeDuty: boolean;
    notifyExpenses: boolean;
    imageUrl?: string | null;
    provider?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    familyId?: string;
    role: Role;
    language?: string;
    colorTheme?: string;
    notification?: boolean;
    notifyCalendar: boolean;
    notifyShopList: boolean;
    notifyHomeDuty: boolean;
    notifyExpenses: boolean;
    imageUrl?: string | null;
    provider?: string | null;
  }
}
