import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { useAlert } from "@/components/logic/AlertProvider";
import MotionButton from "@/components/ui/motion-button";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  User as UserIcon,
  Calendar,
  AlignLeft,
  CheckCircle2,
} from "lucide-react";
import { RecurrenceType } from "@prisma/client";

interface User {
  id: string;
  name: string;
}

interface PopupWindowProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  users: User[];
  onSubmitLocal?: (data: {
    name: string;
    description?: string;
    assignTo: string;
    dueTo: string;
    recurrence: RecurrenceType;
  }) => void;
}

export default function PopupCreateEvent({
  open,
  onOpenChange,
  onSubmitLocal,
  users,
}: PopupWindowProps) {
  const [name, setName] = useState("");
  const [assignTo, setAssignTo] = useState("all");
  const [dueTo, setDueTo] = useState("today");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    RecurrenceType.ONE_TIME,
  );

  const t = useTranslations("HomeDuties");
  const { showAlert } = useAlert();

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setAssignTo("all");
      setDueTo("today");
      setRecurrence(RecurrenceType.ONE_TIME);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      showAlert(t("error"));
      return;
    }

    onSubmitLocal?.({
      name,
      description,
      assignTo,
      dueTo,
      recurrence,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto block max-w-md w-[95vw] sm:rounded-3xl border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-0 gap-0">
        <div className="bg-primary/5 dark:bg-primary/10 p-4 pb-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute top-10 -left-10 w-16 h-16 bg-primary/5 rounded-full blur-xl" />

          <div className="h-10 w-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm mb-2 text-primary z-10">
            <ClipboardList className="w-5 h-5" />
          </div>
          <DialogHeader className="z-10 space-y-1">
            <DialogTitle className="text-lg font-bold tracking-tight">
              {t("popupWindow.title")}
            </DialogTitle>
            <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-tight">
              {t("popupWindow.description")}
            </p>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2"
            >
              <CheckCircle2 className="w-3 h-3" />
              {t("popupWindow.name")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base h-10 rounded-xl bg-muted/30 border-muted-foreground/20 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
              placeholder={
                t("popupWindow.namePlaceholder") || "e.g. Wash dishes"
              }
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                <UserIcon className="w-3 h-3" />
                {t("popupWindow.assignTo")}
              </Label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">
                    {t("all")}
                  </SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {t("popupWindow.dueTo")}
              </Label>
              <Select value={dueTo} onValueChange={setDueTo}>
                <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">
                    {t("popupWindow.today")}
                  </SelectItem>
                  <SelectItem value="tomorrow">
                    {t("popupWindow.tomorrow")}
                  </SelectItem>
                  <SelectItem value="week">{t("popupWindow.week")}</SelectItem>
                  <SelectItem value="month">
                    {t("popupWindow.month")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
              <AlignLeft className="w-3 h-3" />
              {t("popupWindow.description")}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] rounded-xl bg-muted/30 border-muted-foreground/20 resize-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-sm"
              placeholder={
                t("popupWindow.descriptionPlaceholder") || "Details..."
              }
            />
          </div>
        </div>

        <DialogFooter className="p-4 pt-1 bg-transparent">
          <MotionButton
            onClick={handleSubmit}
            className="w-full h-10 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {t("popupWindow.create")}
          </MotionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
