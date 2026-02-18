"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import enLocale from "@fullcalendar/core/locales/en-gb";
import czLocale from "@fullcalendar/core/locales/cs";
import { PriorityType, RecurrenceType } from "@prisma/client";
import { EventContentArg } from "@fullcalendar/core";
import { AnimatePresence } from "framer-motion";

import CustomEvent from "@/app/(protected)/calendar/eventCalendar";
import { useCreateCalendar } from "@/app/(protected)/calendar/createNewEvent";
import EventPopup from "@/app/(protected)/calendar/createEventPopup";
import ComponentForEvent from "@/app/(protected)/calendar/componentForEvent";
import { MobileCalendar } from "@/app/(protected)/calendar/mobileCalendar";
import UpcomingEvents from "@/app/(protected)/calendar/upcomingEvents";
import MotionButton from "@/components/ui/motion-button";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@/components/logic/AlertProvider";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { useHolidays } from "@/hooks/useHolidays";

import { useSession } from "next-auth/react";

type eventsDataProps = {
  id: string;
  name: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  description: string;
  color: string;
  userIds: string[];
  familyId: string;
  recurrence: RecurrenceType;
  priority: PriorityType;
  _realServerId?: string;
};

type OptimisticUpdateProps = Partial<eventsDataProps> & { id: string };

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  backgroundColor: string;
  extendedProps: {
    description: string;
    userIds: string[];
    recurrence: RecurrenceType;
    color: string;
    priority: PriorityType;
    originalEventId?: string;
    realServerId?: string;
    isHoliday?: boolean;
  };
};

const fetchEvents = async (id: string) => {
  const res = await fetch(`/api/calendar?familyId=${id}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export default function CalendarClient() {
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<
    "timeGridDay" | "timeGridWeek" | "dayGridMonth"
  >("timeGridDay");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [openPopup, setOpenPopup] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: session, status } = useSession();

  const userId = session?.user?.id || "";
  const familyId = session?.user?.familyId || "";
  const userName = session?.user?.name || "";
  const language = session?.user?.language || "en";
  const currentUserName = session?.user?.name || "User";
  const [selectedEvent, setSelectedEvent] = useState<
    EventContentArg["event"] | null
  >(null);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [clickedTime, setClickedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const t = useTranslations("Calendar");
  const { showAlert } = useAlert();
  const { createNewEvent } = useCreateCalendar();
  const queryClient = useQueryClient();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);
    const handleResize = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const { data: eventsData } = useQuery({
    queryKey: ["calendarList", familyId],
    queryFn: () => fetchEvents(familyId),
    enabled: !!familyId,
    staleTime: 1000 * 60 * 5,
  });

  const [optimisticEvents, setOptimisticEvents] = useState<eventsDataProps[]>(
    [],
  );
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    OptimisticUpdateProps[]
  >([]);
  const [optimisticDeletes, setOptimisticDeletes] = useState<string[]>([]);
  const holidayEvents = useHolidays(language, userId, userName);

  const realEvents = useMemo(() => {
    let serverEvents = (eventsData as eventsDataProps[]) || [];

    serverEvents = serverEvents.filter(
      (ev: eventsDataProps) => !optimisticDeletes.includes(ev.id),
    );

    const processedServerEvents = serverEvents.map((ev: eventsDataProps) => {
      const matchingOptimistic = optimisticEvents.find(
        (opt) => opt.dateTimeStart === ev.dateTimeStart && opt.name === ev.name,
      );
      const update = optimisticUpdates.find(
        (u) => u.id === (matchingOptimistic?.id || ev.id),
      );
      const finalEventData = update ? { ...ev, ...update } : ev;
      return {
        ...finalEventData,
        id: matchingOptimistic ? matchingOptimistic.id : ev.id,
        _realServerId: ev.id,
      };
    });

    const uniqueOptimisticEvents = optimisticEvents.filter((optEvent) => {
      const existsInServer = processedServerEvents.some(
        (serverEvent: eventsDataProps) =>
          serverEvent._realServerId === optEvent.id ||
          serverEvent.id === optEvent.id,
      );
      const isDeleted = optimisticDeletes.includes(optEvent.id);
      return !existsInServer && !isDeleted;
    });

    const allRawEvents = [...processedServerEvents, ...uniqueOptimisticEvents];

    const expandedEvents: CalendarEvent[] = [];
    const loopCurrentDate = new Date();
    const futureLimit = new Date(loopCurrentDate);
    futureLimit.setMonth(loopCurrentDate.getMonth() + 12);
    allRawEvents.forEach((event: eventsDataProps) => {
      const stableId = event.id;
      const realDatabaseId = event._realServerId || event.id;
      const startDate = new Date(event.dateTimeStart);
      const endDate = new Date(event.dateTimeEnd);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;
      const duration = endDate.getTime() - startDate.getTime();
      const currentOccurrence = new Date(startDate);
      let occurrenceIndex = 0;

      while (currentOccurrence <= futureLimit) {
        expandedEvents.push({
          id: `${stableId}-${occurrenceIndex++}`,
          title: event.name,
          start: currentOccurrence.toISOString(),
          end: new Date(currentOccurrence.getTime() + duration).toISOString(),
          description: event.description ?? "",
          backgroundColor: event.color ?? "transparent",
          extendedProps: {
            description: event.description,
            userIds: event.userIds,
            recurrence: event.recurrence,
            priority: event.priority,
            color: event.color,
            originalEventId: stableId,
            realServerId: realDatabaseId,
          },
        });

        if (event.recurrence === "WEEKLY")
          currentOccurrence.setDate(currentOccurrence.getDate() + 7);
        else if (event.recurrence === "MONTHLY")
          currentOccurrence.setMonth(currentOccurrence.getMonth() + 1);
        else if (event.recurrence === "YEARLY")
          currentOccurrence.setFullYear(currentOccurrence.getFullYear() + 1);
        else if (event.recurrence === "DAILY")
          currentOccurrence.setDate(currentOccurrence.getDate() + 1);
        else break;
      }
    });

    return [...expandedEvents, ...holidayEvents];
  }, [
    eventsData,
    optimisticEvents,
    optimisticUpdates,
    optimisticDeletes,
    holidayEvents,
  ]);
  const updateCurrentDate = () => {
    const api = calendarRef.current?.getApi();
    if (api) setCurrentDate(api.getDate());
  };

  const navigateCalendar = (action: "prev" | "next" | "today") => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api[action]();
    updateCurrentDate();
  };

  const changeView = (newView: typeof view) => {
    setView(newView);
    calendarRef.current?.getApi()?.changeView(newView);
    updateCurrentDate();
  };

  const handleDateClick = (arg: DateClickArg) => {
    setClickedDate(arg.date);
    const hours = arg.date.getHours().toString().padStart(2, "0");
    const minutes = arg.date.getMinutes().toString().padStart(2, "0");

    if (view !== "dayGridMonth") {
      setClickedTime(`${hours}:${minutes}`);
    } else {
      setClickedTime("09:00");
    }

    setRenderKey((prev) => prev + 1);
    setOpenPopup(true);
  };

  const handleEventClick = (event: EventContentArg["event"]) => {
    setSelectedEvent(event);
    setIsEditOpen(true);
  };

  const handleOptimisticUpdate = useCallback((data: OptimisticUpdateProps) => {
    setOptimisticUpdates((prev) => [
      ...prev.filter((u) => u.id !== data.id),
      data,
    ]);
  }, []);

  const handleOptimisticDelete = useCallback((id: string) => {
    setOptimisticDeletes((prev) => [...prev, id]);
  }, []);

  const handleSubmitEvent = async (data: any) => {
    setIsLoading(true);
    const tempId = `temp-${Date.now()}`;

    const newOptimisticEvent: eventsDataProps = {
      id: tempId,
      name: data.name,
      dateTimeStart: data.start.getTime(),
      dateTimeEnd: data.end.getTime(),
      description: data.description || "",
      color: data.color || "blue",
      userIds: [userId],
      familyId: familyId,
      recurrence: data.recurrence,
      priority: data.priority,
    };

    setOptimisticEvents((prev) => [...prev, newOptimisticEvent]);
    setOpenPopup(false);

    setTimeout(async () => {
      try {
        await createNewEvent({
          id: tempId,
          name: data.name,
          dateTimeStart: data.start.toISOString(),
          dateTimeEnd: data.end.toISOString(),
          description: data.description,
          userIds: [userId],
          familyId,
          recurrence: data.recurrence,
          color: data.color,
          priority: data.priority,
          title: t("titleNotification"),
          body: `${currentUserName} ${t("added")}: ${data.name}`,
          currentUser: currentUserName,
        });

        showAlert(`${t("success")}`);
        await queryClient.invalidateQueries({
          queryKey: ["calendarList", familyId],
        });
        setOptimisticEvents((prev) => prev.filter((e) => e.id !== tempId));
      } catch (e) {
        console.error(e);
        setOptimisticEvents((prev) => prev.filter((e) => e.id !== tempId));
        showAlert("Failed to create event");
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  usePageTutorial({
    tutorialId: "calendar_intro",
    steps: [
      {
        element: "#menu-sidebar-button",
        popover: {
          title: t("Tutorial.menu.title"),
          description: t("Tutorial.menu.description"),
          side: "bottom",
        },
      },
      {
        element: "#header-title-button",
        popover: {
          title: t("Tutorial.family.title"),
          description: t("Tutorial.family.description"),
          side: "bottom",
        },
      },
      {
        element: "#tabs-list-calendar-page",
        popover: {
          title: t("Tutorial.calendarTabs.title"),
          description: t("Tutorial.calendarTabs.description"),
          side: "bottom",
        },
      },
      {
        element: "#new-button-calendar-page",
        popover: {
          title: t("Tutorial.createEvent.title"),
          description: t("Tutorial.createEvent.description"),
          side: "left",
          align: "center",
        },
      },
    ],
  });

  const monthYear = currentDate.toLocaleDateString(
    language === "cz" ? "cs-CZ" : "en-US",
    { month: "long", year: "numeric" },
  );
  useEffect(() => updateCurrentDate(), []);

  return (
    <div
      key={isMobile ? "mobile-view" : "desktop-view"}
      className={isMobile ? "flex flex-col h-[84dvh] overflow-hidden" : ""}
    >
      <div
        className={`flex items-center justify-between pb-2 pr-2 ${isMobile ? "flex-shrink-0 pt-2 pl-2" : ""}`}
      >
        <div>
          <h1 className="text-2xl font-medium">{t("title")}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("titleInfo")}
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="AllScheduled"
        className={isMobile ? "flex-1 flex flex-col min-h-0 w-full" : "w-full"}
      >
        <div
          className={`flex items-center justify-between pr-2 ${isMobile ? "flex-shrink-0 pl-2" : ""}`}
        >
          <TabsList id="tabs-list-calendar-page">
            <TabsTrigger value="AllScheduled">{t("allScheduled")}</TabsTrigger>
            <TabsTrigger value="events">{t("events")}</TabsTrigger>
          </TabsList>
          <MotionButton
            id="new-button-calendar-page"
            onClick={() => {
              setClickedDate(null);
              setClickedTime(null);
              setRenderKey((prev) => prev + 1);
              setOpenPopup(true);
            }}
            className="text-xs sm:text-sm"
          >
            {t("newEventButton")}
          </MotionButton>
        </div>

        <div
          className={`w-full h-px bg-gray-200 dark:bg-gray-700 my-2 ${isMobile ? "flex-shrink-0" : ""}`}
        />

        <TabsContent
          value="AllScheduled"
          className={
            isMobile
              ? "flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden"
              : ""
          }
        >
          {!isMobile ? (
            <>
              <div className="flex items-center justify-between pr-2 my-2">
                <div
                  id="div-smallButtons-calendarMove"
                  className="flex items-center space-x-2"
                >
                  <h1 className="text-xl font-medium">{monthYear}</h1>
                  <MotionButton
                    size="sm"
                    variant="outline"
                    onClick={() => navigateCalendar("prev")}
                  >
                    &lt;
                  </MotionButton>
                  <MotionButton
                    size="sm"
                    variant="outline"
                    onClick={() => navigateCalendar("next")}
                  >
                    &gt;
                  </MotionButton>
                  <MotionButton
                    size="sm"
                    onClick={() => navigateCalendar("today")}
                  >
                    {t("today")}
                  </MotionButton>
                </div>

                <Tabs
                  id="tabs-calendar-view"
                  value={view}
                  onValueChange={(val) => changeView(val as typeof view)}
                >
                  <TabsList className="flex space-x-2">
                    <TabsTrigger value="timeGridDay">{t("day")}</TabsTrigger>
                    <TabsTrigger value="timeGridWeek">{t("week")}</TabsTrigger>
                    <TabsTrigger value="dayGridMonth">{t("month")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="rounded-lg overflow-hidden border border-primary bg-white dark:bg-black relative">
                <FullCalendar
                  locale={language === "cz" ? czLocale : enLocale}
                  timeZone="local"
                  ref={calendarRef}
                  plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                  initialView={view}
                  headerToolbar={false}
                  allDaySlot={false}
                  slotMinTime="06:00:00"
                  slotMaxTime="24:00:00"
                  nowIndicator
                  dayCellClassNames="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                  slotLaneClassNames="cursor-pointer hover:bg-muted/50 transition-colors"
                  slotEventOverlap={false}
                  dateClick={handleDateClick}
                  events={realEvents}
                  eventContent={(arg: EventContentArg) => (
                    <CustomEvent
                      event={arg.event}
                      language={language as "en" | "cz"}
                      isWeekView={arg.view.type === "timeGridWeek"}
                      color={arg.event.extendedProps.color as string}
                      onEventClick={handleEventClick}
                    />
                  )}
                  height="auto"
                  eventTimeFormat={
                    language === "en"
                      ? { hour: "numeric", minute: "2-digit", hour12: true }
                      : { hour: "2-digit", minute: "2-digit", hour12: false }
                  }
                  slotLabelFormat={
                    language === "en"
                      ? { hour: "numeric", minute: "2-digit", hour12: true }
                      : { hour: "2-digit", minute: "2-digit", hour12: false }
                  }
                  dayHeaderFormat={(arg) => {
                    const jsDate = new Date(arg.date.marker);
                    const weekday = jsDate.toLocaleDateString(
                      language === "cz" ? "cs-CZ" : "en-US",
                      { weekday: "long" },
                    );
                    const numeric = jsDate.toLocaleDateString(
                      language === "cz" ? "cs-CZ" : "en-US",
                      { day: "numeric", month: "numeric" },
                    );
                    if (view == "dayGridMonth") {
                      return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;
                    } else {
                      return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${numeric}`;
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-hidden relative mx-2 mb-2">
              <div className="absolute inset-0 h-full w-full overflow-hidden">
                <MobileCalendar
                  language={language as "en" | "cz"}
                  events={realEvents}
                  onEventClick={(event) => {
                    const originalEvent = realEvents.find(
                      (re) => re.id === event.id,
                    );
                    if (originalEvent) {
                      const mockFcEvent = {
                        id: originalEvent.id,
                        title: originalEvent.title,
                        start: new Date(originalEvent.start),
                        end: new Date(originalEvent.end),
                        backgroundColor: originalEvent.backgroundColor,
                        extendedProps: { ...originalEvent.extendedProps },
                        allDay: false,
                        publicId: originalEvent.id,
                      } as unknown as EventContentArg["event"];

                      setSelectedEvent(mockFcEvent);
                      setIsEditOpen(true);
                    } else {
                      const mockFcEvent = {
                        id: event.id,
                        title: event.title,
                        start: new Date(event.start),
                        end: new Date(event.end),
                        backgroundColor: event.backgroundColor,
                        extendedProps: { ...event.extendedProps },
                      } as unknown as EventContentArg["event"];
                      setSelectedEvent(mockFcEvent);
                      setIsEditOpen(true);
                    }
                  }}
                  onAddEventClick={(date) => {
                    setClickedDate(date);
                    setClickedTime("09:00");
                    setRenderKey((prev) => prev + 1);
                    setOpenPopup(true);
                  }}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          <UpcomingEvents
            events={realEvents
              .filter((e) => !e.extendedProps.isHoliday)
              .filter(
                (e) =>
                  e.extendedProps.recurrence == ("ONE_TIME" as RecurrenceType),
              )
              .map((e) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                start: new Date(e.start),
                end: new Date(e.end),
                priority: e.extendedProps?.priority,
                color: e.extendedProps?.color,
              }))}
            familyId={familyId}
            language={language}
            onEventClick={(event) => {
              const originalEvent = realEvents.find((re) => re.id === event.id);
              if (originalEvent) {
                const mockFcEvent = {
                  id: originalEvent.id,
                  title: originalEvent.title,
                  start: new Date(originalEvent.start),
                  end: new Date(originalEvent.end),
                  backgroundColor: originalEvent.backgroundColor,
                  extendedProps: { ...originalEvent.extendedProps },
                  allDay: false,
                  publicId: originalEvent.id,
                } as unknown as EventContentArg["event"];
                setSelectedEvent(mockFcEvent);
                setIsEditOpen(true);
              }
            }}
          />
        </TabsContent>
      </Tabs>

      <EventPopup
        key={renderKey}
        open={openPopup}
        onOpenChange={(open) => {
          setOpenPopup(open);
          if (!open)
            setTimeout(() => {
              setClickedDate(null);
              setClickedTime(null);
            }, 200);
        }}
        onSubmitLocal={handleSubmitEvent}
        defaultDate={clickedDate || new Date()}
        defaultTime={clickedTime || "09:00"}
      />

      <AnimatePresence>
        {isEditOpen && selectedEvent && (
          <ComponentForEvent
            key="edit-modal"
            open={isEditOpen}
            setOpen={setIsEditOpen}
            event={selectedEvent}
            language={language as "en" | "cz"}
            familyId={familyId}
            color={selectedEvent.extendedProps.color}
            onOptimisticUpdate={(data) => {
              const realId =
                selectedEvent.extendedProps?.originalEventId || data.id;
              handleOptimisticUpdate({ ...data, id: realId });
            }}
            onOptimisticDelete={(id) => {
              const realId = selectedEvent.extendedProps?.originalEventId || id;
              handleOptimisticDelete(realId);
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
