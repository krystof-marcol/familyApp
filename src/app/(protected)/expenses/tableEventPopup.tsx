import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Currency, ExpenseCategory } from "@prisma/client";
import { useSession } from "next-auth/react";
import { cs, enUS } from "date-fns/locale";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { useAlert } from "@/components/logic/AlertProvider";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import {
  Trash2,
  CalendarIcon,
  Tag,
  Banknote,
  User,
  FileText,
  Check,
} from "lucide-react";
import MotionButton from "@/components/ui/motion-button";

interface ExpensesListProps {
  id: string;
  name: string;
  amount: string;
  currency: Currency;
  date: Date;
  note?: string;
  category: ExpenseCategory;
  user: {
    id: string;
    name: string;
  };
}

type OptimisticUpdateProps = Partial<ExpensesListProps> & { id: string };

interface PopupWindowProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
  name: string;
  amount: string;
  currency: Currency;
  date: Date;
  note?: string;
  category: ExpenseCategory;
  userId: string;
  userName: string;
  familyId: string;
  optimisticUpdate: (data: OptimisticUpdateProps) => void;
  optimisticDelete: (id: string) => void;
}

const realDate = (date: number | string | Date) => {
  const dateString = new Date(date);
  const day = dateString.getDate();
  const month = dateString.getMonth() + 1;
  const year = dateString.getFullYear();
  return `${day}.${month}.${year}`;
};

export default function TableEventPopup(props: PopupWindowProps) {
  const t = useTranslations("Expenses");
  const { showAlert } = useAlert();

  const [name, setName] = useState(props.name);
  const [amount, setAmount] = useState(props.amount);
  const [category, setCategory] = useState<ExpenseCategory>(
    props.category || ExpenseCategory.FOOD,
  );
  const [notes, setNotes] = useState(props.note || "");
  const [currency, setCurrency] = useState<Currency>(
    props.currency || Currency.EUR,
  );
  const [date, setDate] = useState(() => new Date(props.date));

  const { data: session } = useSession();
  const language = session?.user?.language || "en";
  const locale = language === "cz" ? cs : enUS;

  const initialName = props.name;
  const initialAmount = props.amount;
  const initialCategory = props.category;
  const initialDate = props.date;
  const initialNotes = props.note;
  const initialCurrency = props.currency;

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const hasChanges =
    name !== initialName ||
    amount !== initialAmount ||
    category !== initialCategory ||
    currency !== initialCurrency ||
    (notes !== "" && notes !== initialNotes) ||
    !isSameDay(date, new Date(initialDate));

  const handleSave = async () => {
    const updatedData: OptimisticUpdateProps = {
      id: props.id,
      name: name,
      amount: amount,
      currency: currency,
      category: category,
      note: notes,
      date: date,
    };

    props.optimisticUpdate(updatedData);
    props.setOpen(false);

    try {
      const res = await fetch("/api/expenses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: props.id,
          name,
          amount: Number(amount),
          currency,
          category,
          note: notes,
          date: date,
          userId: props.userId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      showAlert(t("successUpdate") || "Updated successfully");
    } catch (err) {
      console.error(err);
      showAlert(`${t("error")}: ${err}`);
    }
  };

  const handleDelete = async (id: string) => {
    props.optimisticDelete(id);
    props.setOpen(false);

    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      showAlert(t("deleteMessage"));
    } catch (err) {
      console.error(err);
      showAlert(`${t("error")}: ${err}`);
    }
  };

  useEffect(() => {
    if (props.open) {
      setName(props.name || "");
      setAmount(props.amount || "0");
      setCategory(props.category || ExpenseCategory.FOOD);
      setCurrency(props.currency || Currency.EUR);
      setDate(new Date(props.date));
      setNotes(props.note || "");
    }
  }, [
    props.open,
    props.name,
    props.amount,
    props.category,
    props.currency,
    props.date,
    props.note,
  ]);

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-lg w-[95vw] md:w-full p-0 gap-0 border-none shadow-xl sm:rounded-xl max-h-[90dvh] overflow-y-auto block"
      >
        <div className="h-3 w-full bg-primary" />

        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="hidden">Edit Expense</DialogTitle>

          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Expense Name"
                className="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 h-auto"
              />

              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-600 mt-1 ml-2" />
                <div className="flex items-baseline gap-1">
                  <Input
                    type="number"
                    inputMode="decimal"
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-3xl font-semibold border-none px-0 shadow-none focus-visible:ring-0 w-[140px] text-emerald-600 tracking-tight h-auto p-0 pt-3.5"
                  />
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value as Currency)}
                  >
                    <SelectTrigger className="w-auto border-none shadow-none focus:ring-0 text-muted-foreground font-medium h-auto p-0 gap-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Currency).map((cur) => (
                        <SelectItem key={cur} value={cur}>
                          {cur}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 p-6 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-8 flex justify-center">
              <Tag className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as ExpenseCategory)}
              >
                <SelectTrigger className="w-full border-border/60">
                  <SelectValue placeholder={t("Table.category")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ExpenseCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`category.${cat}`) || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 flex justify-center">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal border-border/60",
                    !date && "text-muted-foreground",
                  )}
                >
                  <span className="truncate">
                    {date ? format(date, "PPP", { locale }) : realDate(date)}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  locale={locale}
                  disabled={{ after: new Date() }}
                  onSelect={(date) => {
                    setDate(date || new Date());
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 flex justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 flex items-center justify-between border rounded-md px-3 py-2 bg-muted/20 border-border/60">
              <span className="text-sm text-muted-foreground">
                {t("Table.who")}
              </span>
              <span className="text-sm font-medium">{props.userName}</span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 flex justify-center pt-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("popupWindow.description") || "Add details..."}
              className="min-h-[80px] resize-none border-border/60 focus-visible:ring-1 w-full"
            />
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted/30 border-t flex flex-row items-center justify-between sm:justify-between gap-4">
          <MotionButton
            variant="ghost"
            size="sm"
            className=" text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(props.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("Table.delete")}
          </MotionButton>

          <div className="flex gap-2">
            <MotionButton
              size="sm"
              variant="default"
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-6"
            >
              <Check className="h-4 w-4 mr-2" />
              {t("Table.save")}
            </MotionButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
