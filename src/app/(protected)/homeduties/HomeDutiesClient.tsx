"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { GET_FAMILY_BY_USERID } from "@/graphql";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client";
import PopupCreateEvent from "@/app/(protected)/homeduties/popupCreateEvent";
import { useAlert } from "@/components/logic/AlertProvider";
import { useCreateHomeDuty } from "@/app/(protected)/homeduties/createEventFunc";
import HomeDutiesComponent from "@/app/(protected)/homeduties/events";
import { useIsMobile } from "@/hooks/use-mobile";
import MotionButton from "@/components/ui/motion-button";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { Skeleton } from "@/components/ui/skeleton";
import { RecurrenceType } from "@prisma/client";
import {
  useQuery as useReactQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export interface HomeDutiesListProps {
  id: string;
  name: string;
  description: string;
  assignTo: string;
  dueTo: string;
  recurrence: RecurrenceType;
  userIds?: string[];
  familyId?: string;
}

interface UserProps {
  id: string;
  name: string;
  role: string;
}

export type OptimisticUpdateProps = Partial<HomeDutiesListProps> & {
  id: string;
};

const fetchEvents = async (id: string) => {
  const res = await fetch(`/api/home-chores?familyId=${id}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export default function HomeDutiesClient() {
  const t = useTranslations("HomeDuties");
  const { showAlert } = useAlert();
  const { createNewEvent } = useCreateHomeDuty();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [selectAssignTo, setSelectAssignTo] = useState("all");

  const [optimisticEvents, setOptimisticEvents] = useState<
    HomeDutiesListProps[]
  >([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    OptimisticUpdateProps[]
  >([]);
  const [optimisticDeletes, setOptimisticDeletes] = useState<string[]>([]);
  const { data: session, status } = useSession();

  const userId = session?.user?.id || "";
  const familyId = session?.user?.familyId || "";
  const userColorTheme = session?.user?.colorTheme;
  const currentUserName = session?.user?.name;

  const { data: familyData, loading: familyLoading } = useQuery(
    GET_FAMILY_BY_USERID,
    {
      variables: { userId },
      fetchPolicy: "cache-first",
    },
  );

  const { data: eventsData, isLoading: eventsLoading } = useReactQuery({
    queryKey: ["homeDutiesList", familyId],
    queryFn: () => fetchEvents(familyId),
    enabled: !!familyId,
  });

  const usersList = useMemo(() => {
    const dataUsers = familyData?.familyByUserId?.members ?? [];
    return dataUsers.map((user: UserProps) => ({
      id: user.id,
      name: user.name,
      role: user.role,
    }));
  }, [familyData]);

  const homeDutiesEvents = useMemo(() => {
    const rawEvents = Array.isArray(eventsData) ? eventsData : [];
    let processedEvents = rawEvents.map((list: HomeDutiesListProps) => ({
      id: list.id,
      name: list.name,
      description: list.description || "",
      assignTo: list.assignTo,
      recurrence: list.recurrence,
      dueTo: new Date(list.dueTo).getTime().toString(),
    }));

    processedEvents = processedEvents.filter(
      (ev: HomeDutiesListProps) => !optimisticDeletes.includes(ev.id),
    );

    processedEvents = processedEvents.map((ev: HomeDutiesListProps) => {
      const update = optimisticUpdates.find((u) => u.id === ev.id);
      return update ? { ...ev, ...update } : ev;
    });

    const uniqueOptimisticEvents = optimisticEvents.filter((optEvent) => {
      const existsInServer = processedEvents.some(
        (serverEvent: HomeDutiesListProps) => serverEvent.id === optEvent.id,
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

  const makeTime = (time: string): string | null => {
    const now = new Date();
    switch (time) {
      case "today":
        return now.toISOString();
      case "tomorrow":
        return new Date(now.setDate(now.getDate() + 1)).toISOString();
      case "week":
        return new Date(now.setDate(now.getDate() + 7)).toISOString();
      case "month":
        return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      default:
        return now.toISOString();
    }
  };

  function isoToTimestampString(isoString: string): string {
    const date = new Date(isoString);
    return date.getTime().toString();
  }

  const handleSubmitEvent = async (data: {
    name: string;
    description?: string;
    assignTo: string;
    dueTo: string;
    recurrence: RecurrenceType;
  }) => {
    const permanentId = crypto.randomUUID().toString();

    const newOptimisticItem: HomeDutiesListProps = {
      id: permanentId,
      name: data.name,
      description: data.description || "",
      assignTo: data.assignTo,
      dueTo: isoToTimestampString(makeTime(data.dueTo) || ""),
      recurrence: data.recurrence,
      userIds: [userId],
      familyId,
    };

    setOptimisticEvents((prev) => [...prev, newOptimisticItem]);
    setOpen(false);

    setTimeout(async () => {
      try {
        await createNewEvent({
          id: permanentId,
          name: data.name,
          description: data.description,
          assignTo: data.assignTo,
          dueTo: makeTime(data.dueTo) || "",
          userIds: [userId],
          recurrence: data.recurrence || ("ONE_TIME" as RecurrenceType),
          familyId,
          title: t("titleNotification"),
          body: `${currentUserName} ${t("added")}: ${data.name}`,
          currentUser: currentUserName || "",
        });

        showAlert(`${t("success")}`);
        await queryClient.invalidateQueries({
          queryKey: ["homeDutiesList", familyId],
        });
      } catch (e) {
        console.error(e);
        showAlert(t("error"));
      } finally {
        setOptimisticEvents((prev) =>
          prev.filter((item) => item.id !== permanentId),
        );
      }
    }, 0);
  };

  usePageTutorial({
    tutorialId: "homeChores_intro",
    steps: [
      {
        element: "#select-assign-to",
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
        <h1 className="text-2xl font-medium">{t("title")}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t("info")}</p>
        <br />
        <div className="flex items-center justify-between">
          <Select value={selectAssignTo} onValueChange={setSelectAssignTo}>
            <SelectTrigger
              id="select-assign-to"
              className="text-xs sm:text-sm w-32"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              {familyLoading && usersList.length === 0 ? (
                <div className="p-2 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                usersList.map((user: UserProps) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <MotionButton
            id="add-new-event"
            className="text-xs sm:text-sm"
            onClick={() => setOpen(true)}
          >
            {t("new")}
          </MotionButton>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2" />

      {!isMobile && (
        <div
          className="w-full grid items-center pt-2 pr-6 pl-12 text-sm font-semibold text-muted-foreground"
          style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
        >
          <div className="text-center pl-9">{t("popupWindow.name")}</div>
          <div className="text-center">{t("popupWindow.assignTo")}</div>
          <div className="text-center pr-9">{t("left")}</div>
        </div>
      )}

      {open && (
        <PopupCreateEvent
          open={open}
          users={usersList}
          onOpenChange={setOpen}
          onSubmitLocal={handleSubmitEvent}
        />
      )}

      {eventsLoading && homeDutiesEvents.length === 0 ? (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : (
        <HomeDutiesComponent
          familyId={familyId}
          events={homeDutiesEvents}
          assignTo={selectAssignTo}
          theme={userColorTheme || ""}
          availableUsers={usersList}
          users={usersList}
          onOptimisticDelete={handleOptimisticDelete}
          onOptimisticUpdate={handleOptimisticUpdate}
        />
      )}
    </>
  );
}
