import { PriorityType, ShopListCategory } from "@prisma/client";
import { sendFamilyNotification } from "@/lib/notification";

interface ShopListInput {
  id?: string;
  name: string;
  description?: string;
  familyId: string;
  userIds: string[];
  priority: PriorityType;
  quantity?: number;
  category: ShopListCategory;
  title: string;
  body: string;
  currentUser: string;
}

export function useCreateShopList() {
  const createNewEvent = async (value: ShopListInput) => {
    sendFamilyNotification({
      type: "EVENT_CREATED",
      typeCategory: "shopList",
      variables: {
        userName: value.currentUser,
        eventName: value.name,
      },
      familyId: value.familyId,
      excludeUserId: value.userIds[0],
      url: "/shoplist",
    });
    const res = await fetch(`/api/shop-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: value.name,
        id: value.id,
        description: value.description || null,
        category: value.category,
        familyId: value.familyId,
        priority: value.priority,
        quantity: value.quantity,
        userIds: value.userIds,
      }),
    });
    if (!res.ok) {
      throw new Error("Error creating shop list");
    }
    return await res.json();
  };

  return { createNewEvent };
}
