import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { useAlert } from "@/components/logic/AlertProvider";
import { ExpenseCategory, Currency } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cs, enUS } from "date-fns/locale";
import { format } from "date-fns";
import MotionButton from "@/components/ui/motion-button";

interface PopupWindowProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  language: string;
  onSubmitLocal?: (data: {
    name: string;
    currency: Currency;
    amount: number;
    note?: string;
    category: ExpenseCategory;
    date: Date;
  }) => void;
  constCurrency: Currency;
}

export default function PopupCreateEvent({
  open,
  onOpenChange,
  onSubmitLocal,
  language,
  constCurrency,
}: PopupWindowProps) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState<Currency>(
    (constCurrency as Currency) || Currency.EUR,
  );
  const [category, setCategory] = useState<ExpenseCategory>(
    ExpenseCategory.FOOD,
  );
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const t = useTranslations("Expenses");
  const { showAlert } = useAlert();
  const locale = language === "cz" ? cs : enUS;

  const handleSubmit = () => {
    if (!name) {
      showAlert(t("error"));
      return;
    }
    setName("");
    setNote("");
    setCurrency(Currency.EUR);
    setAmount("");
    setCategory(ExpenseCategory.FOOD);
    setDate(new Date());

    onSubmitLocal?.({
      name,
      note,
      currency,
      amount: Number(amount),
      category,
      date,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] md:w-full mx-auto rounded-lg border-3 border-primary max-h-[90dvh] overflow-y-auto block">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {t("popupWindow.title")}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            {t("popupWindow.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:gap-4 py-3 md:py-4 p-1">
          <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center ">
            <Label
              htmlFor="name"
              className="text-sm md:text-base md:text-right"
            >
              {t("popupWindow.name")}:
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="md:col-span-3 text-sm md:text-base"
              placeholder={t("popupWindow.namePlaceholder")!}
            />
          </div>
          <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center">
            <Label className="text-sm md:text-base md:text-right">
              {t("popupWindow.amount")}:
            </Label>
            <div className="md:col-span-3 flex items-center gap-3">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-24"
                min={0}
                step={1}
              />
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value as Currency)}
              >
                <SelectTrigger className="w-24 md:w-28 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Currency.EUR}>EUR</SelectItem>
                  <SelectItem value={Currency.CZK}>CZK</SelectItem>
                  <SelectItem value={Currency.USD}>USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center">
            <Label className="text-sm md:text-base md:text-right">
              {t("popupWindow.category")}:
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ExpenseCategory)}
            >
              <SelectTrigger className="md:col-span-3 text-sm md:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ExpenseCategory.FOOD}>
                  {t("category.FOOD")}
                </SelectItem>
                <SelectItem value={ExpenseCategory.HEALTH}>
                  {t("category.HEALTH")}
                </SelectItem>
                <SelectItem value={ExpenseCategory.ENTERTAINMENT}>
                  {t("category.ENTERTAINMENT")}
                </SelectItem>
                <SelectItem value={ExpenseCategory.BILLS}>
                  {t("category.BILLS")}
                </SelectItem>
                <SelectItem value={ExpenseCategory.SHOPPING}>
                  {t("category.SHOPPING")}
                </SelectItem>
                <SelectItem value={ExpenseCategory.TRANSPORT}>
                  {t("category.TRANSPORT")}
                </SelectItem>
                <SelectItem value={ExpenseCategory.OTHER}>
                  {t("category.OTHER")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center">
            <Label className="text-sm md:text-base md:text-right">
              {t("popupWindow.when")}:
            </Label>
            <div className="md:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-auto justify-start text-left font-normal dark:hover:text-white text-sm md:text-base",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {date
                        ? format(date, "PPP", { locale: locale })
                        : t("pickDate")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    required={true}
                    locale={locale}
                    disabled={{ after: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-2 md:gap-4 md:items-center">
            <Label className="text-sm md:text-base md:text-right">
              {t("popupWindow.description")}:
            </Label>
            <Textarea
              id="description"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="md:col-span-3 text-sm md:text-base min-h-[80px] md:min-h-auto"
              placeholder={t("popupWindow.descriptionPlaceholder")!}
            />
          </div>
        </div>
        <DialogFooter>
          <MotionButton
            onClick={handleSubmit}
            className="flex-1 md:flex-auto text-sm md:text-base"
          >
            {t("popupWindow.create")}
          </MotionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
