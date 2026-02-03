import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/timePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecurrenceType, PriorityType } from "@prisma/client";
import { useAlert } from "@/components/logic/AlertProvider";
import { cs, enUS } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { ColorPicker } from "@/components/ColorPicker";
import MotionButton from "@/components/ui/motion-button";

interface EventPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitLocal?: (data: {
    name: string;
    start: Date;
    end: Date;
    description?: string;
    color?: string;
    recurrence: RecurrenceType;
    priority: PriorityType;
  }) => void;
  defaultDate?: Date;
  defaultTime?: string;
}

export default function EventPopup({
  open,
  onOpenChange,
  onSubmitLocal,
  defaultDate,
  defaultTime,
}: EventPopupProps) {
  const t = useTranslations("EventPopup");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(
    defaultDate || new Date(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    defaultDate || new Date(),
  );
  const [startTime, setStartTime] = useState(defaultTime || "09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    RecurrenceType.ONE_TIME,
  );
  const [priority, setPriority] = useState<PriorityType>(PriorityType.NORMAL);
  const { showAlert } = useAlert();
  const { data: session } = useSession();
  const language = session?.user?.language || "en";
  const locale = language === "cz" ? cs : enUS;
  const [color, setColor] = useState("color1");

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
            `${String(newEndHour).padStart(2, "0")}:${String(sm).padStart(2, "0")}`,
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

  const handleSubmit = () => {
    if (!startDate || !endDate || !name) {
      showAlert(t("error"));
      return;
    }
    setName("");
    setDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime("09:00");
    setEndTime("10:00");
    setRecurrence(RecurrenceType.ONE_TIME);
    setPriority(PriorityType.NORMAL);
    setColor("color1");

    const start = new Date(startDate);
    const [sh, sm] = startTime.split(":").map(Number);
    start.setHours(sh, sm);

    const end = new Date(endDate);
    const [eh, em] = endTime.split(":").map(Number);
    end.setHours(eh, em);

    onSubmitLocal?.({
      name,
      start,
      end,
      description,
      recurrence,
      color,
      priority,
    });
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      setStartDate(defaultDate || new Date());
      setEndDate(defaultDate || new Date());

      const start = defaultTime || "09:00";
      setStartTime(start);
      const [hours, minutes] = start.split(":").map(Number);
      const nextHour = (hours + 1) % 24;
      const end = `${nextHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      setEndTime(end);
    }
  }, [open, defaultDate, defaultTime]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] md:w-full mx-auto rounded-lg border-3 border-primary max-h-[90dvh] overflow-y-auto block p-0">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg md:text-xl">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {t("description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:gap-4 py-3 md:py-4">
            <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center ">
              <Label
                htmlFor="name"
                className="text-sm md:text-base md:text-right"
              >
                {t("name")}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="md:col-span-3 text-sm md:text-base"
                placeholder={t("namePlaceholder")!}
              />
            </div>

            <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center">
              <Label className="text-sm md:text-base md:text-right">
                {t("start")}
              </Label>
              <div className="md:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full md:w-auto justify-start text-left font-normal dark:hover:text-white text-sm md:text-base",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {startDate
                          ? format(startDate, "PPP", { locale: locale })
                          : t("pickDate")}
                      </span>
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

                <TimePicker
                  value={startTime || "09:00"}
                  onChange={handleStartTimeChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center">
              <Label className="text-sm md:text-base md:text-right">
                {t("end")}
              </Label>
              <div className="md:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full md:w-auto justify-start text-left font-normal dark:hover:text-white text-sm md:text-base",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {endDate
                          ? format(endDate, "PPP", { locale: locale })
                          : t("pickDate")}
                      </span>
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
                <TimePicker value={endTime} onChange={handleEndTimeChange} />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center">
              <Label className="text-sm md:text-base md:text-right">
                {t("recurrence")}
              </Label>
              <Select
                value={recurrence}
                onValueChange={(value) =>
                  setRecurrence(value as RecurrenceType)
                }
              >
                <SelectTrigger className="md:col-span-3 text-sm md:text-base">
                  <SelectValue placeholder={t("recurrence")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RecurrenceType.ONE_TIME}>
                    {t("recurrenceOptions.oneTime")}
                  </SelectItem>
                  <SelectItem value={RecurrenceType.DAILY}>
                    {t("recurrenceOptions.daily")}
                  </SelectItem>
                  <SelectItem value={RecurrenceType.WEEKLY}>
                    {t("recurrenceOptions.weekly")}
                  </SelectItem>
                  <SelectItem value={RecurrenceType.MONTHLY}>
                    {t("recurrenceOptions.monthly")}
                  </SelectItem>
                  <SelectItem value={RecurrenceType.YEARLY}>
                    {t("recurrenceOptions.yearly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center">
              <Label className="text-sm md:text-base md:text-right">
                {t("priority")}
              </Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as PriorityType)}
              >
                <SelectTrigger className="md:col-span-3 text-sm md:text-base">
                  <SelectValue placeholder={"PRIORITY"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PriorityType.HIGH}>
                    {t("priorityType.high")}
                  </SelectItem>
                  <SelectItem value={PriorityType.NORMAL}>
                    {t("priorityType.normal")}
                  </SelectItem>
                  <SelectItem value={PriorityType.LOW}>
                    {t("priorityType.low")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex  md:grid-cols-4 gap-12  md:gap-20 md:items-center mb-2 ">
                <Label
                  htmlFor="name"
                  className="text-sm md:text-base md:text-right"
                >
                  {t("color")}
                </Label>
                <ColorPicker value={color} onChange={setColor} />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-start">
              <Label
                htmlFor="description"
                className="text-sm md:text-base md:text-right"
              >
                {t("description")}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="md:col-span-3 text-sm md:text-base min-h-[80px] md:min-h-auto"
                placeholder={t("descriptionPlaceholder")!}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <MotionButton
              onClick={handleSubmit}
              className="flex-1 md:flex-auto text-sm md:text-base"
            >
              {t("create")}
            </MotionButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
