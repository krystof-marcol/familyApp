import { Metadata } from "next";
import CalendarClient from "./CalendarClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Calendar page",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  return <CalendarClient serverFamilyId={session?.user?.familyId || ""} />;
}
