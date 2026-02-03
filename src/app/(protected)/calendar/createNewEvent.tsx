import { PriorityType, RecurrenceType } from "@prisma/client";
import { sendFamilyNotification } from "@/lib/notification";

interface CalendarInput {
  name: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  description?: string;
  familyId: string;
  userIds: string[];
  recurrence: RecurrenceType;
  color?: string;
  priority: PriorityType;
  id: string;
  body: string;
  title: string;
  currentUser: string;
}

export function useCreateCalendar() {
  const createNewEvent = async (value: CalendarInput) => {
    try {
      sendFamilyNotification({
        type: "EVENT_CREATED",
        typeCategory: "calendar",
        variables: {
          userName: value.currentUser,
          eventName: value.name,
        },
        familyId: value.familyId,
        excludeUserId: value.userIds[0],
        url: "/calendar",
      });
    } catch (error) {
      console.error("Notification failed", error);
    }

    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: value.id,
        name: value.name,
        dateTimeStart: value.dateTimeStart,
        dateTimeEnd: value.dateTimeEnd,
        description: value.description || null,
        familyId: value.familyId,
        recurrence: value.recurrence,
        priority: value.priority,
        color: value.color || null,
        userIds: value.userIds,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create event");
    }

    return await res.json();
  };

  return { createNewEvent };
}
