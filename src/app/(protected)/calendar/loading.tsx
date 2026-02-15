import { getLocale, getTranslations } from "next-intl/server";
import { CalendarShell } from "@/app/(protected)/calendar/CalendarShell";

export default async function Loading() {
  const t = await getTranslations("Calendar");
  const locale = await getLocale();
  const now = new Date();
  const dateLocale = locale === "cz" ? "cs-CZ" : "en-US";
  let monthYear = now.toLocaleDateString(dateLocale, {
    month: "long",
    year: "numeric",
  });
  let formattedDate = now.toLocaleDateString(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "numeric",
  });

  formattedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  return (
    <CalendarShell
      title={t("title")}
      subtitle={t("titleInfo")}
      tab1={t("allScheduled")}
      tab2={t("events")}
      btnNew={t("newEventButton")}
      todayBtn={t("today")}
      viewBtns={[t("day"), t("week"), t("month")]}
      dateTitle={monthYear}
      datePrecise={formattedDate}
      language={locale}
    />
  );
}
