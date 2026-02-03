"use client";

import { useTranslations } from "next-intl";
import ShopListComponent from "@/app/(protected)/shoplist/ShopLIstComponent";
import { useMemo, useState, useCallback } from "react";
import PopupWindow from "@/app/(protected)/shoplist/popupWindow";
import { PriorityType, ShopListCategory } from "@prisma/client";
import { useCreateShopList } from "@/app/(protected)/shoplist/createNewShopList";
import { useAlert } from "@/components/logic/AlertProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MotionButton from "@/components/ui/motion-button";
import {
  useQuery as useReactQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export type ShopListProps = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: ShopListCategory;
  priority: PriorityType;
  assignTo?: string;
  dueTo?: string;
};

type ShopListPropsPopupWindow = {
  name: string;
  description?: string;
  quantity?: number;
  category: ShopListCategory;
  priority: PriorityType;
};

export type OptimisticUpdateProps = Partial<ShopListProps> & { id: string };

const fetchEvents = async (id: string) => {
  const res = await fetch(`/api/shop-list?familyId=${id}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export default function ShopListClient() {
  const t = useTranslations("ShopList");
  const [open, setOpen] = useState(false);
  const { createNewEvent } = useCreateShopList();
  const { showAlert } = useAlert();
  const isMobile = useIsMobile();
  const [selectPriority, setSelectPriority] = useState("all");
  const [selectCategory, setSelectCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: session, status } = useSession();

  const userId = session?.user?.id || "";
  const familyId = session?.user?.familyId || "";
  const userColorTheme = session?.user?.colorTheme;
  const currentUserName = session?.user?.name;

  const [optimisticEvents, setOptimisticEvents] = useState<ShopListProps[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    OptimisticUpdateProps[]
  >([]);
  const [optimisticDeletes, setOptimisticDeletes] = useState<string[]>([]);

  const { data: eventsData, isLoading: eventsLoading } = useReactQuery({
    queryKey: ["shoppingList", familyId],
    queryFn: () => fetchEvents(familyId),
    enabled: !!familyId,
  });

  const shopItems = useMemo(() => {
    let processedEvents = (eventsData || []).map((list: ShopListProps) => ({
      id: list.id,
      name: list.name,
      category: list.category,
      priority: list.priority,
      quantity: list.quantity,
    }));

    processedEvents = processedEvents.filter(
      (ev: ShopListProps) => !optimisticDeletes.includes(ev.id),
    );

    processedEvents = processedEvents.map((ev: ShopListProps) => {
      const update = optimisticUpdates.find((u) => u.id === ev.id);
      return update ? { ...ev, ...update } : ev;
    });

    const uniqueOptimisticEvents = optimisticEvents.filter((optEvent) => {
      const existsInServer = processedEvents.some(
        (serverEvent: ShopListProps) => serverEvent.id === optEvent.id,
      );
      const isDeleted = optimisticDeletes.includes(optEvent.id);

      return !existsInServer && !isDeleted;
    });

    return [...processedEvents, ...uniqueOptimisticEvents];
  }, [eventsData, optimisticEvents, optimisticUpdates, optimisticDeletes]);

  const handleOptimisticUpdate = useCallback((data: OptimisticUpdateProps) => {
    setOptimisticUpdates((prev) => [
      ...prev.filter((u) => u.id !== data.id),
      data,
    ]);
  }, []);

  const handleOptimisticDelete = useCallback((id: string) => {
    setOptimisticDeletes((prev) => [...prev, id]);
  }, []);

  const handleSubmitEvent = async (data: ShopListPropsPopupWindow) => {
    const permanentId = crypto.randomUUID().toString();

    const newOptimisticItem: ShopListProps = {
      id: permanentId,
      name: data.name,
      description: data.description || "",
      priority: data.priority,
      category: data.category,
      quantity: data.quantity || 1,
    };

    setOptimisticEvents((prev) => [...prev, newOptimisticItem]);
    setOpen(false);

    setTimeout(async () => {
      try {
        await createNewEvent({
          id: permanentId,
          name: data.name,
          description: data.description,
          userIds: [userId],
          familyId,
          priority: data.priority,
          category: data.category,
          quantity: data.quantity,
          title: t("titleNotification"),
          body: `${currentUserName} ${t("added")}: ${data.name}`,
          currentUser: currentUserName || "",
        });

        showAlert(`${t("addedMessage")}`);
        await queryClient.invalidateQueries({
          queryKey: ["shoppingList", familyId],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setOptimisticEvents((prev) =>
          prev.filter((item) => item.id !== permanentId),
        );
      }
    }, 0);
  };

  usePageTutorial({
    tutorialId: "shopList_intro",
    steps: [
      {
        element: "#div-select",
        popover: {
          title: t("Tutorial.select.title"),
          description: t("Tutorial.select.description"),
          side: "bottom",
        },
      },
      {
        element: "#add-new-event",
        popover: {
          title: t("Tutorial.createEvent.title"),
          description: t("Tutorial.createEvent.description"),
          side: "bottom",
        },
      },
    ],
  });

  if (status === "loading") {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="h-[80vh] border rounded-md bg-muted/10" />
      </div>
    );
  }

  return (
    <>
      <div>
        <div>
          <h1 className="text-2xl font-medium">{t("title")}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("info")}
          </p>
          <br />
          <div className="flex items-center justify-between">
            <div id="div-select" className="flex items-center gap-2">
              <Select value={selectCategory} onValueChange={setSelectCategory}>
                <SelectTrigger className="text-xs sm:w-full sm:text-sm w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("category.all")}</SelectItem>
                  <SelectItem value="FOOD">{t("category.FOOD")}</SelectItem>
                  <SelectItem value="CLOTHES">
                    {t("category.CLOTHES")}
                  </SelectItem>
                  <SelectItem value="ENTERTAINMENT">
                    {t("category.ENTERTAINMENT")}
                  </SelectItem>
                  <SelectItem value="HEALTH">{t("category.HEALTH")}</SelectItem>
                  <SelectItem value="HOUSE">{t("category.HOUSE")}</SelectItem>
                  <SelectItem value="OTHER">{t("category.OTHER")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectPriority} onValueChange={setSelectPriority}>
                <SelectTrigger className="text-xs sm:w-full sm:text-sm w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("priority.all")}</SelectItem>
                  <SelectItem value="HIGH">{t("priority.HIGH")}</SelectItem>
                  <SelectItem value="NORMAL">{t("priority.NORMAL")}</SelectItem>
                  <SelectItem value="LOW">{t("priority.LOW")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <MotionButton
              id="add-new-event"
              className="text-xs sm:text-sm"
              onClick={() => {
                setOpen(true);
              }}
            >
              {t("new")}
            </MotionButton>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2" />

      {!isMobile && (
        <div
          className="w-full grid items-center pt-2 pr-6 pl-12 text-sm font-semibold text-muted-foreground"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
          }}
        >
          <div className="text-center pl-9">{t("name")}</div>
          <div className="text-center pl-3">{t("categoryName")}</div>
          <div className="text-center pr-4">{t("priorityName")}</div>
          <div className="text-center pr-8">{t("quantity")}</div>
        </div>
      )}

      {open && (
        <PopupWindow
          open={open}
          onOpenChange={setOpen}
          onSubmitLocal={handleSubmitEvent}
        />
      )}

      {eventsLoading && shopItems.length === 0 ? (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : (
        <ShopListComponent
          events={shopItems}
          familyId={familyId}
          theme={userColorTheme || ""}
          priority={selectPriority}
          category={selectCategory}
          onOptimisticUpdate={handleOptimisticUpdate}
          onOptimisticDelete={handleOptimisticDelete}
        />
      )}
    </>
  );
}
