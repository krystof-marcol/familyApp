import { ExpenseCategory, Currency } from "@prisma/client";
import { sendFamilyNotification } from "@/lib/notification";

interface ExpensesInput {
  id: string;
  name: string;
  currency: Currency;
  amount: number;
  note?: string;
  category: ExpenseCategory;
  date: Date;
  familyId: string;
  userIds: string;
  title: string;
  body: string;
  currentUser: string;
}

export function useCreateExpenses() {
  const createNewEvent = async (value: ExpensesInput) => {
    sendFamilyNotification({
      type: "EVENT_CREATED",
      typeCategory: "expenses",
      variables: {
        userName: value.currentUser,
        eventName: value.name,
      },
      familyId: value.familyId,
      excludeUserId: value.userIds,
      url: "/expenses",
    });
    const res = await fetch(`/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: value.id,
        name: value.name,
        amount: value.amount,
        currency: value.currency,
        date: value.date,
        note: value.note,
        category: value.category,
        familyId: value.familyId,
        userId: value.userIds,
      }),
    });
    if (!res.ok) {
      throw new Error("Error creating expense");
    }
    return await res.json();
  };
  return { createNewEvent };
}
