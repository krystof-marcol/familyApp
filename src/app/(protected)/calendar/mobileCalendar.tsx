"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { RecurrenceType, PriorityType } from "@prisma/client";
import { Plus, X, Clock, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageTutorial } from "@/hooks/usePageTutorial";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  backgroundColor?: string;
  extendedProps?: {
    description?: string;
    userIds?: string[];
    recurrence?: RecurrenceType;
    color?: string;
    priority?: PriorityType;
    originalEventId?: string;
    realServerId?: string;
    isHoliday?: boolean;
  };
}

interface MobileCalendarProps {
  language: "en" | "cz";
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddEventClick: (date: Date) => void;
}

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const en_list = ["S", "M", "T", "W", "T", "F", "S"];
const cz_list = ["N", "P", "Ú", "S", "Č", "P", "S"];

const MonthView = React.memo(
  ({
    year,
    month,
    today,
    todayRef,
    selectedDate,
    eventsMap,
    li,
    formatDate,
    handleDateClick,
  }: {
    year: number;
    month: number;
    today: Date;
    todayRef: React.RefObject<HTMLDivElement | null>;
    selectedDate: Date | null;
    eventsMap: Record<string, CalendarEvent[]>;
    li: string[];
    formatDate: (date: Date, format: string) => string;
    handleDateClick: (year: number, month: number, day: number) => void;
  }) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const isCurrentMonth =
      year === today.getFullYear() && month === today.getMonth();

    return (
      <div
        className="flex-shrink-0 pb-8"
        ref={isCurrentMonth ? todayRef : null}
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md py-3 px-6">
          <h2 className="text-lg font-bold text-foreground capitalize">
            {formatDate(new Date(year, month), "MMMM yyyy")}
          </h2>
        </div>

        <div className="px-0 pt-4">
          <div className="grid grid-cols-7 gap-y-4">
            {li.map((day, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2"
              >
                {day}
              </div>
            ))}

            {blanks.map((i) => (
              <div key={`blank-${i}`} className="min-h-[72px] w-full" />
            ))}

            {days.map((day) => {
              const currentDate = new Date(year, month, day);
              const dateKey = getDateKey(currentDate);
              const dayEvents = eventsMap[dateKey] || [];
              const totalEvents = dayEvents.length;

              const isToday = isSameDay(currentDate, today);
              const isSelected =
                selectedDate && isSameDay(currentDate, selectedDate);

              const showCounter = totalEvents > 2;
              const visibleEvents = showCounter
                ? dayEvents.slice(0, 1)
                : dayEvents.slice(0, 2);
              const remaining = totalEvents - visibleEvents.length;

              return (
                <div
                  key={day}
                  className="flex flex-col items-center justify-start min-h-[72px] cursor-pointer w-full"
                  onClick={() => handleDateClick(year, month, day)}
                >
                  <button
                    className={cn(
                      "relative h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 mb-0",
                      isSelected
                        ? "bg-foreground text-background font-semibold"
                        : isToday
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-foreground hover:bg-muted",
                    )}
                  >
                    {day}
                  </button>

                  <div className="flex flex-col w-full px-0.5 gap-[2px]">
                    {visibleEvents.map((ev, i) => {
                      const color = ev.extendedProps?.color
                        ? `var(--${ev.extendedProps.color})`
                        : "#3b82f6";
                      return (
                        <div
                          key={i}
                          style={{
                            backgroundColor: `color-mix(in srgb, ${color}, transparent 85%)`,
                            borderColor: color,
                            color: color,
                          }}
                          className="w-full flex items-center gap-1 border rounded-md px-1 py-[1px] overflow-hidden"
                        >
                          <span
                            style={{ color: color }}
                            className="text-xs leading-tight truncate font-medium text-foreground/80"
                          >
                            {ev.title}
                          </span>
                        </div>
                      );
                    })}

                    {showCounter && (
                      <div className="text-[9px] font-medium text-muted-foreground text-center bg-muted/20 rounded-[3px]">
                        +{remaining}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

MonthView.displayName = "MonthView";

export function MobileCalendar({
  language,
  events,
  onEventClick,
  onAddEventClick,
}: MobileCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEvents, setShowEvents] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Calendar");
  const today = new Date();

  const eventsMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);

      const loopDate = new Date(startDate);
      loopDate.setHours(0, 0, 0, 0);

      const lastDate = new Date(endDate);
      lastDate.setHours(0, 0, 0, 0);

      while (loopDate <= lastDate) {
        const key = getDateKey(loopDate);
        if (!map[key]) map[key] = [];
        map[key].push(event);
        loopDate.setDate(loopDate.getDate() + 1);
      }
    });

    Object.keys(map).forEach((key) => {
      map[key].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    });
    return map;
  }, [events]);

  const months = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() + i - 6, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
      }),
    [],
  );

  const li = useMemo(() => (language === "en" ? en_list : cz_list), [language]);

  useLayoutEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "instant", // Force instant jump, no smooth scrolling
        block: "center", // Center the current month
      });
    }
  }, []);

  const formatDate = useCallback(
    (date: Date, format: string) => {
      const monthsArr = [
        t("months.0"),
        t("months.1"),
        t("months.2"),
        t("months.3"),
        t("months.4"),
        t("months.5"),
        t("months.6"),
        t("months.7"),
        t("months.8"),
        t("months.9"),
        t("months.10"),
        t("months.11"),
      ];

      if (format === "MMMM yyyy")
        return `${monthsArr[date.getMonth()]} ${date.getFullYear()}`;
      if (format === "d") return date.getDate().toString();
      return date.toString();
    },
    [t],
  );

  const handleDateClick = useCallback(
    (year: number, month: number, day: number) => {
      const date = new Date(year, month, day);
      setSelectedDate(date);
      setShowEvents(true);
    },
    [],
  );

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const target = new Date(selectedDate);
      target.setHours(0, 0, 0, 0);
      return (
        target.getTime() >= start.getTime() && target.getTime() <= end.getTime()
      );
    });
  }, [selectedDate, events]);

  const handleCloseEventsList = () => {
    setShowEvents(false);
    setSelectedDate(null);
  };

  usePageTutorial({
    tutorialId: "mobileCalendar_intro",
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
        element: "#header-icon-button",
        popover: {
          title: t("Tutorial.profile.title"),
          description: t("Tutorial.profile.description"),
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

  return (
    <div className="relative bg-background w-full h-[100dvh] overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto hide-scrollbar pb-36"
      >
        {months.map((m, i) => (
          <MonthView
            key={`${m.year}-${m.month}`}
            year={m.year}
            month={m.month}
            today={today}
            todayRef={todayRef}
            selectedDate={selectedDate}
            eventsMap={eventsMap}
            li={li}
            formatDate={formatDate}
            handleDateClick={handleDateClick}
          />
        ))}
      </div>

      <AnimatePresence>
        {showEvents && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleCloseEventsList}
              style={{ willChange: "opacity" }}
            />

            <motion.div
              className="fixed pb-20 left-0 right-0 z-40 bg-background rounded-t-[32px] shadow-2xl border-t border-border overflow-hidden flex flex-col max-h-[85vh]"
              style={{ willChange: "transform", bottom: "0px" }}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              exit={{ y: "110%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                mass: 0.8,
              }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.05}
              dragSnapToOrigin={true}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  handleCloseEventsList();
                }
              }}
            >
              <div className="w-full flex justify-center pt-3 pb-2 bg-background cursor-grab active:cursor-grabbing touch-none">
                <div className="w-12 h-1.5 bg-muted rounded-full" />
              </div>

              <div className="px-6 pb-4 flex justify-between items-end border-b border-border/40 bg-background">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {selectedDate &&
                      new Intl.DateTimeFormat(
                        language === "cz" ? "cs-CZ" : "en-US",
                        { weekday: "long" },
                      ).format(selectedDate)}
                  </p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {selectedDate && formatDate(selectedDate, "d")}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      selectedDate && onAddEventClick(selectedDate)
                    }
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleCloseEventsList}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3 overflow-y-auto pb-10 bg-muted/10 flex-1">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {
                    const start = new Date(event.start);
                    const end = new Date(event.end);
                    const timeString = `${start.getHours()}:${start.getMinutes().toString().padStart(2, "0")} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, "0")}`;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onEventClick(event)}
                        className="group relative bg-card rounded-2xl p-4 shadow-sm border border-border/50 cursor-pointer overflow-hidden"
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1.5"
                          style={{
                            backgroundColor:
                              `var(--${event.extendedProps?.color})` ||
                              "#3b82f6",
                          }}
                        />
                        <div className="pl-3">
                          <h4 className="font-semibold text-lg text-foreground leading-tight mb-1">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{timeString}</span>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm text-muted-foreground/80 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <CalendarIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      {t("mobileCalendar.info")}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
