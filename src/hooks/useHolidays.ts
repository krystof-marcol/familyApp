import { useMemo } from "react";
import Holidays from "date-holidays";
import { PriorityType, RecurrenceType } from "@prisma/client";

type HolidayUser = {
  __typename: "User";
  id: string;
  name: string;
};

export const useHolidays = (
  language: string,
  userId: string,
  userName: string,
) => {
  return useMemo(() => {
    const countryCode = language === "cz" ? "CZ" : "US";
    const hd = new Holidays(countryCode);
    const currentYear = new Date().getFullYear();

    const rawHolidays = [
      ...hd.getHolidays(currentYear),
      ...hd.getHolidays(currentYear + 1),
    ];

    const filteredHolidays = rawHolidays.filter((h) => {
      if (h.type !== "public") return false;

      const ignoredRules = ["good_friday"];
      return !ignoredRules.includes(h.rule);
    });

    return filteredHolidays.map((h) => {
      const startDate = new Date(h.date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      const customHolidayData = {
        id: `holiday-${startDate.getTime()}`,
        name: h.name,
        dateTimeStart: startDate.getTime().toString(),
        dateTimeEnd: endDate.getTime().toString(),
        description: "Public Holiday",
        color: "color1",
        users: [
          {
            __typename: "User",
            id: userId,
            name: userName,
          },
        ],
        recurrence: "YEARLY" as RecurrenceType,
        priority: "LOW" as PriorityType,
      };

      return {
        id: customHolidayData.id,
        title: customHolidayData.name,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor: customHolidayData.color,
        description: customHolidayData.description,
        extendedProps: {
          ...customHolidayData,
          isHoliday: true,
        },
      };
    });
  }, [language, userId, userName]);
};
