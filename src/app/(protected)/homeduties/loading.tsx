import HomeDutiesShell from "@/app/(protected)/homeduties/homeDutiesShell";
import { getLocale, getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("HomeDuties");
  const locale = await getLocale();
  return <HomeDutiesShell />;
}
