import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Check,
  Trash2,
  Clock,
  AlignLeft,
  Flag,
  Palette,
  ArrowRight,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/timePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAlert } from "@/components/logic/AlertProvider";
import { cs, enUS } from "date-fns/locale";
import { EventContentArg } from "@fullcalendar/core";
import { ColorPicker } from "@/components/ColorPicker";
import MotionButton from "@/components/ui/motion-button";
import { PriorityType, RecurrenceType } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

export interface OptimisticEventData {
  id: string;
  name: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  description?: string;
  color?: string;
  priority: PriorityType;
  recurrence?: RecurrenceType;
}

interface CustomEventProps {
  event: EventContentArg["event"];
  open: boolean;
  setOpen: (open: boolean) => void;
  language: "en" | "cz";
  familyId: string;
  color?: string;
  onOptimisticUpdate: (data: OptimisticEventData) => void;
  onOptimisticDelete: (id: string) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ComponentForEvent: React.FC<CustomEventProps> = ({
  event,
  open,
  setOpen,
  language,
  familyId,
  color,
  onOptimisticUpdate,
  onOptimisticDelete,
  isLoading,
  setIsLoading,
}) => {
  const t = useTranslations("Calendar");
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const locale = language === "cz" ? cs : enUS;

  const [title, setTitle] = useState(event.title || "");
  const [colorLocal, setColor] = useState(color || "color1");
  const [description, setDescription] = useState(
    event.extendedProps?.description || "",
  );
  const [priority, setPriority] = useState<PriorityType>(
    event.extendedProps?.priority || "NORMAL",
  );
  const [start, setStart] = useState<Date>(event.start || new Date());
  const [end, setEnd] = useState<Date>(event.end || new Date());

  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    priority: "",
    colorLocal: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const eventStart = event.start || new Date();
    const eventEnd = event.end || new Date();

    const eventTitle = event.title || "";
    const eventDescription = event.extendedProps?.description || "";
    const eventPriority = event.extendedProps?.priority || "NORMAL";
    const eventStartTime = `${String(eventStart.getHours()).padStart(
      2,
      "0",
    )}:${String(eventStart.getMinutes()).padStart(2, "0")}`;
    const eventEndTime = `${String(eventEnd.getHours()).padStart(
      2,
      "0",
    )}:${String(eventEnd.getMinutes()).padStart(2, "0")}`;

    setTitle(eventTitle);
    setDescription(eventDescription);
    setPriority(eventPriority);
    setStart(eventStart);
    setEnd(eventEnd);
    setStartDate(eventStart);
    setEndDate(eventEnd);
    setStartTime(eventStartTime);
    setEndTime(eventEndTime);
    setColor(color || "color1");

    setInitialValues({
      title: eventTitle,
      description: eventDescription,
      priority: eventPriority,
      startDate: eventStart,
      colorLocal: color || "color1",
      endDate: eventEnd,
      startTime: eventStartTime,
      endTime: eventEndTime,
    });
  }, [event, color]);

  const handleStartTimeChange = (newTime: string) => {
    setStartTime(newTime);
    if (startDate && endDate) {
      const isSameDay = startDate.toDateString() === endDate.toDateString();
      if (isSameDay) {
        const [sh, sm] = newTime.split(":").map(Number);
        const [eh, em] = endTime.split(":").map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        if (endMinutes <= startMinutes) {
          const newEndHour = (sh + 1) % 24;
          setEndTime(
            `${String(newEndHour).padStart(2, "0")}:${String(sm).padStart(
              2,
              "0",
            )}`,
          );
        }
      }
    }
  };

  const handleEndTimeChange = (newTime: string) => {
    if (startDate && endDate) {
      const isSameDay = startDate.toDateString() === endDate.toDateString();
      if (isSameDay) {
        const [sh, sm] = startTime.split(":").map(Number);
        const [eh, em] = newTime.split(":").map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        if (endMinutes < startMinutes) {
          showAlert(t("endTimeBeforeStartTime"));
          return;
        }
      }
    }
    setEndTime(newTime);
  };

  const sameDay = (a?: Date | null, b?: Date | null) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const hasChanges = () => {
    return (
      title !== initialValues.title ||
      description !== initialValues.description ||
      priority !== initialValues.priority ||
      !sameDay(startDate, initialValues.startDate) ||
      !sameDay(endDate, initialValues.endDate) ||
      startTime !== initialValues.startTime ||
      endTime !== initialValues.endTime ||
      colorLocal !== initialValues.colorLocal
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    const finalStart = new Date(startDate || start);
    const [sh, sm] = startTime.split(":").map(Number);
    finalStart.setHours(sh, sm);

    const finalEnd = new Date(endDate || end);
    const [eh, em] = endTime.split(":").map(Number);
    finalEnd.setHours(eh, em);

    const mutationId = event.extendedProps?.realServerId || event.id;

    const mutationPayload = {
      id: mutationId,
      name: title,
      description,
      priority,
      color: colorLocal,
      dateTimeStart: finalStart.toISOString(),
      dateTimeEnd: finalEnd.toISOString(),
      recurrence: event.extendedProps?.recurrence || "NONE",
    };

    const optimisticPayload = {
      ...mutationPayload,
      id: event.id,
      dateTimeStart: finalStart.toISOString(),
      dateTimeEnd: finalEnd.toISOString(),
    };

    onOptimisticUpdate(optimisticPayload);
    setOpen(false);
    showAlert(t("updated"));

    setTimeout(async () => {
      try {
        const res = await fetch("/api/calendar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mutationPayload),
        });

        if (!res.ok) throw new Error("Failed to update");

        queryClient.invalidateQueries({ queryKey: ["calendarList", familyId] });
      } catch (err) {
        console.error("Update failed", err);
        showAlert("Failed to save changes on server");
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    onOptimisticDelete(event.id);
    setOpen(false);
    showAlert(t("deleteMessage"));

    const mutationId = event.extendedProps?.realServerId || event.id;

    setTimeout(async () => {
      try {
        const res = await fetch(`/api/calendar?id=${mutationId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete");

        queryClient.invalidateQueries({ queryKey: ["calendarList", familyId] });
      } catch (err) {
        console.error("Delete failed", err);
        showAlert("Failed to delete from server");
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  const formatHolidayDate = (
    date: Date | string | undefined | null,
    language: "en" | "cz",
  ) => {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    return dateObj.toLocaleDateString(language === "cz" ? "cs-CZ" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (event.id.slice(0, 7) == "holiday") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="mr-1 w-full overflow-hidden rounded-2xl border border-border shadow-lg"
        >
          <div className="h-24 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 w-full flex items-center justify-center">
            <div className="bg-white dark:bg-black p-3 rounded-full shadow-sm">
              <CalendarDays className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="px-6 pb-8 pt-2 text-center">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold text-center">
                {event.title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-1 items-center justify-center bg-muted/50 py-3 px-4 rounded-lg">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {language === "cz" ? "Datum" : "Date"}
              </span>
              <span className="text-lg font-medium text-foreground">
                {formatHolidayDate(event.start, language)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-lg w-[95vw] md:w-full p-0 gap-0 shadow-xl sm:rounded-xl border-1 border-primary max-h-[90dvh] overflow-y-auto block"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[500px] w-full gap-4">
            <DialogTitle></DialogTitle>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">
              {"Data is loading..."}
            </p>
          </div>
        ) : (
          <>
            <div
              className="h-3 w-full transition-colors duration-300 ease-in-out"
              style={{ backgroundColor: colorLocal }}
            />

            <DialogHeader className="px-6 pt-6 pb-2">
              <div className="flex justify-between items-start gap-2">
                <DialogTitle className="flex-1">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("namePlaceholder") || "Add Title"}
                    className="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 h-auto"
                  />
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6 p-6 pt-2">
              <div className="flex gap-4 items-start group">
                <Clock className="w-5 h-5 mt-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="flex flex-col gap-3 flex-1 w-full">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal border-border/60 hover:bg-accent/50 hover:text-black dark:hover:text-white w-full sm:w-auto",
                            !startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                          {startDate
                            ? format(startDate, "PPP", { locale })
                            : t("pickDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          locale={locale}
                          onSelect={(date) => {
                            setStartDate(date);
                            if (endDate && date && endDate < date) {
                              setEndDate(date);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="w-full sm:w-[110px]">
                      <TimePicker
                        value={startTime}
                        onChange={handleStartTimeChange}
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block pl-6 text-muted-foreground/20">
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </div>

                  <div className="block sm:hidden w-full h-px bg-border/40 my-1" />

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal border-border/60 hover:bg-accent/50 hover:text-black dark:hover:text-white w-full sm:w-auto",
                            !endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                          {endDate
                            ? format(endDate, "PPP", { locale })
                            : t("pickDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          locale={locale}
                          onSelect={setEndDate}
                          disabled={(date) =>
                            !!startDate &&
                            date < new Date(startDate.setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="w-full sm:w-[110px]">
                      <TimePicker
                        value={endTime}
                        onChange={handleEndTimeChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3 items-start">
                  <Palette className="w-5 h-5 mt-1.5 text-muted-foreground" />
                  <div className="flex gap-2 flex-wrap pt-1">
                    <ColorPicker value={color} onChange={setColor} />
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <Flag className="w-5 h-5 text-muted-foreground" />
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as PriorityType)}
                  >
                    <SelectTrigger className="w-full border-border/60">
                      <SelectValue placeholder={t("priority")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">
                        <span className="flex items-center gap-2 text-red-500 font-medium">
                          {t("priorityType.high")}
                        </span>
                      </SelectItem>
                      <SelectItem value="NORMAL">
                        {t("priorityType.normal")}
                      </SelectItem>
                      <SelectItem value="LOW" className="text-muted-foreground">
                        {t("priorityType.low")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <AlignLeft className="w-5 h-5 mt-2.5 text-muted-foreground" />
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("description") || "Add description"}
                  className="min-h-[100px] resize-none border-border/60 focus-visible:ring-1 w-full"
                />
              </div>
            </div>

            <DialogFooter className="p-4 bg-muted/30 border-t flex flex-row items-center justify-between sm:justify-between gap-4">
              <MotionButton
                variant="ghost"
                size="sm"
                className=" text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("delete")}
              </MotionButton>

              <div className="flex gap-3">
                <MotionButton
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges()}
                  className="px-6"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t("save")}
                </MotionButton>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComponentForEvent;
