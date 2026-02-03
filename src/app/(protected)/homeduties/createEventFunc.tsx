import { useMutation } from "@apollo/client";
import { CREATE_HOMEDUTY } from "@/graphql";
import { sendFamilyNotification } from "@/lib/notification";
import { RecurrenceType } from "@prisma/client";

interface HomeDutyInput {
  id: string;
  name: string;
  description?: string;
  familyId: string;
  userIds: string[];
  assignTo: string;
  recurrence: RecurrenceType;
  dueTo: string;
  title: string;
  body: string;
  currentUser: string;
}

export function useCreateHomeDuty() {
  const [createHomeDuty] = useMutation(CREATE_HOMEDUTY);

  const createNewEvent = async (value: HomeDutyInput) => {
    sendFamilyNotification({
      type: "EVENT_CREATED",
      typeCategory: "homeDuty",
      variables: {
        userName: value.currentUser,
        eventName: value.name,
      },
      familyId: value.familyId,
      excludeUserId: value.userIds[0],
      url: "/homeduties",
    });
    const res = await fetch("/api/home-chores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: value.id,
        name: value.name,
        description: value.description || null,
        assignTo: value.assignTo,
        dueTo: value.dueTo,
        familyId: value.familyId,
        recurrence: value.recurrence,
        userIds: value.userIds,
      }),
    });
  };

  return { createNewEvent };
}
