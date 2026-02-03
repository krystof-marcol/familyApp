import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PriorityType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { DELETE_CALENDAR, GET_CALENDARS } from "@/graphql";
import { useMutation } from "@apollo/client";

interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  priority: PriorityType;
  color?: string;
}

interface UpcomingEventsProps {
  events: Event[];
  familyId: string;
  language: string;
  onEventClick: (event: Event) => void;
}
const EN_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const CZ_DAYS = [
  "Neděle",
  "Pondělí",
  "Úterý",
  "Středa",
  "Čtvrtek",
  "Pátek",
  "Sobota",
];

export default function UpcomingEvents({
  events,
  familyId,
  language,
  onEventClick,
}: UpcomingEventsProps) {
  const sortedEvents = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  const t = useTranslations("Calendar");
  const days = useMemo(() => {
    return language === "cz" ? CZ_DAYS : EN_DAYS;
  }, [language]);

  const now = new Date();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [deleteCalendar] = useMutation(DELETE_CALENDAR, {
    refetchQueries: [
      {
        query: GET_CALENDARS,
        variables: { familyId },
      },
    ],
    awaitRefetchQueries: true,
  });

  const renderEvents = (priority: PriorityType) => {
    const filtered = sortedEvents.filter(
      (e) => e.priority === priority && e.end.getTime() >= now.getTime(),
    );

    const onDelete = async (id: string) => {
      await deleteCalendar({
        variables: {
          id,
        },
      });
    };

    if (filtered.length === 0) {
      return <p className="text-sm text-muted-foreground">{t("noEvents")}</p>;
    }

    return (
      <div className="space-y-2">
        {filtered.map((event) => (
          <Card
            key={event.id}
            className="hover:shadow-sm transition overflow-hidden relative cursor-pointer"
            onClick={() => onEventClick(event)}
          >
            <div
              className="w-2 absolute inset-y-0 left-0 rounded-r-md"
              style={{
                backgroundColor: `var(--${event.color})` || "var(--primary)",
              }}
            />

            <CardContent className="p-0">
              <div className="p-3 pl-5 flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {event.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {days[event.start.getDay()]},{" "}
                    {event.start.toLocaleDateString(language)}{" "}
                    {event.start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    –
                    {event.end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild></AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("deleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("deleteConfirmText")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onDelete(selectedEventId);
                            setSelectedEventId("");
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t("confirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Tabs defaultValue="Normal" className="w-full h-full">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-xl font-medium">{t("priority")}:</h1>
          <TabsList className="h-9">
            <TabsTrigger value="Low">{t("priorityType.low")}</TabsTrigger>
            <TabsTrigger value="Normal">{t("priorityType.normal")}</TabsTrigger>
            <TabsTrigger value="High">{t("priorityType.high")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="Low">{renderEvents("LOW")}</TabsContent>
        <TabsContent value="Normal">{renderEvents("NORMAL")}</TabsContent>
        <TabsContent value="High">{renderEvents("HIGH")}</TabsContent>
      </Tabs>
    </div>
  );
}
