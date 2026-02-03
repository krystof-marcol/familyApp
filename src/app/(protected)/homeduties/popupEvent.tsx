import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cs, enUS } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@apollo/client";
import { UPDATE_HOMEDUTY, DELETE_HOMEDUTY, GET_HOMEDUTIES } from "@/graphql";
import { useAlert } from "@/components/logic/AlertProvider";
import MotionButton from "@/components/ui/motion-button";
import { OptimisticUpdateProps } from "@/app/(protected)/homeduties/HomeDutiesClient";

interface User {
  id: string;
  name: string;
  role: string;
}

interface PopupWindowProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  familyId: string;
  description?: string;
  name: string;
  id: string;
  assignTo: string;
  dueTo: string;
  availableUsers: User[];
  onOptimisticUpdate?: (data: OptimisticUpdateProps) => void;
  onOptimisticDelete?: (id: string) => void;
}

const realDate = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export default function PopupEvent(props: PopupWindowProps) {
  const t = useTranslations("HomeDuties");
  const { showAlert } = useAlert();
  const { data: session } = useSession();
  const language = session?.user?.language || "en";
  const locale = language === "cz" ? cs : enUS;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [dueTo, setDueTo] = useState(new Date());

  const initialName = props.name;
  const initialDescription = props.description || "";
  const initialAssignTo = props.assignTo;
  const initialDueTo = new Date(Number(props.dueTo));

  const [updateHomeDuty] = useMutation(UPDATE_HOMEDUTY, {
    refetchQueries: [
      {
        query: GET_HOMEDUTIES,
        variables: { familyId: props.familyId },
      },
    ],
    awaitRefetchQueries: true,
  });

  const [deleteHomeDuty] = useMutation(DELETE_HOMEDUTY, {
    refetchQueries: [
      {
        query: GET_HOMEDUTIES,
        variables: { familyId: props.familyId },
      },
    ],
    awaitRefetchQueries: true,
  });

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const hasChanges =
    name !== initialName ||
    description !== initialDescription ||
    assignTo !== initialAssignTo ||
    !isSameDay(dueTo, initialDueTo);

  const getDays = (date: Date) => {
    const dueDate = new Date(date);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSave = async () => {
    if (props.onOptimisticUpdate) {
      props.onOptimisticUpdate({
        id: props.id,
        name,
        description,
        assignTo: assignTo.toLowerCase(),
        dueTo: dueTo.getTime().toString(),
      });
    }

    props.setOpen(false);

    try {
      await updateHomeDuty({
        variables: {
          input: {
            id: props.id,
            name,
            description,
            assignTo: assignTo.toLowerCase(),
            dueTo: dueTo.toISOString(),
          },
        },
      });

      showAlert(t("updateMessage"));
    } catch (err) {
      console.error(err);
      showAlert(`${err}`);
    }
  };

  const handleDelete = async () => {
    if (props.onOptimisticDelete) {
      props.onOptimisticDelete(props.id);
    }

    props.setOpen(false);

    try {
      await deleteHomeDuty({
        variables: {
          id: props.id,
        },
      });

      showAlert(t("deleteMessage"));
    } catch (err) {
      console.error(err);
      showAlert(`${err}`);
    }
  };

  const handleClose = () => {
    props.setOpen(false);
    setName("");
    setDescription("");
    setAssignTo("");
    setDueTo(new Date());
  };

  useEffect(() => {
    setName(props.name || "");
    setDescription(props.description || "");
    setAssignTo(props.assignTo || "");
    setDueTo(new Date(Number(props.dueTo)));
  }, [props.name, props.description, props.assignTo, props.dueTo]);

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogTitle></DialogTitle>
      <DialogContent
        className="max-w-md w-[95vw] p-0 gap-0  max-h-[90dvh] overflow-y-auto block"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-6 pt-6 pb-4 relative">
          <div
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          ></div>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("popupWindow.name")}
            className="text-lg font-semibold border-0 border-b rounded-sm w-full"
          />
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm md:text-base md:text-right">
              {t("popupWindow.description")}:
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("popupWindow.descriptionPlaceholder")}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm md:text-base md:text-right">
                {t("popupWindow.assignTo")}:
              </Label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger className="w-[50%] text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {props.availableUsers?.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <Label className="text-sm md:text-base md:text-right">
                {t("popupWindow.dueTo")}:
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[50%] justify-start text-left font-normal text-sm md:text-base"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{realDate(dueTo)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueTo}
                    locale={locale}
                    onSelect={(date) => {
                      setDueTo(date || new Date());
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <Label className="text-sm md:text-base md:text-right">
                {t("left")}:
              </Label>
              <span className="font-medium text-sm">
                {getDays(dueTo)} {t("days")}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-2">
          <MotionButton
            variant="destructive"
            onClick={handleDelete}
            className="flex-1 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t("delete")}
          </MotionButton>
          <MotionButton
            variant="default"
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1"
          >
            {t("save")}
          </MotionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
