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
import { PriorityType, ShopListCategory } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { useAlert } from "@/components/logic/AlertProvider";
import MotionButton from "@/components/ui/motion-button";
import { cn } from "@/lib/utils";
import {
  Apple,
  Shirt,
  HeartPulse,
  Home,
  Gamepad2,
  Package,
  Minus,
  Plus,
  ShoppingBasket,
  AlignLeft,
  Tag,
} from "lucide-react";

interface PopupWindowProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  onSubmitLocal?: (data: {
    name: string;
    description?: string;
    priority: PriorityType;
    category: ShopListCategory;
    quantity?: number;
  }) => void;
}

const CategoryIcon = ({
  category,
  className,
}: {
  category: ShopListCategory;
  className?: string;
}) => {
  const props = { className: cn("w-4 h-4", className) };
  switch (category) {
    case "FOOD":
      return <Apple {...props} />;
    case "CLOTHES":
      return <Shirt {...props} />;
    case "HEALTH":
      return <HeartPulse {...props} />;
    case "HOUSE":
      return <Home {...props} />;
    case "ENTERTAINMENT":
      return <Gamepad2 {...props} />;
    default:
      return <Package {...props} />;
  }
};

export default function PopupWindow({
  open,
  onOpenChange,
  onSubmitLocal,
}: PopupWindowProps) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<PriorityType>(PriorityType.NORMAL);
  const [category, setCategory] = useState<ShopListCategory>(
    ShopListCategory.FOOD,
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [description, setDescription] = useState("");
  const t = useTranslations("EventPopupShopList");
  const { showAlert } = useAlert();

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setCategory(ShopListCategory.FOOD);
      setPriority(PriorityType.NORMAL);
      setQuantity(1);
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
      category,
      priority,
      quantity,
    });
    onOpenChange(false);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto block max-w-md w-[95vw] sm:rounded-3xl border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-0 gap-0">
        <div className="bg-primary/5 dark:bg-primary/10 p-4 pb-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute top-10 -left-10 w-16 h-16 bg-primary/5 rounded-full blur-xl" />

          <div className="h-10 w-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm mb-2 text-primary z-10">
            <ShoppingBasket className="w-5 h-5" />
          </div>
          <DialogHeader className="z-10 space-y-1">
            <DialogTitle className="text-lg font-bold tracking-tight">
              {t("title")}
            </DialogTitle>
            <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-tight">
              {t("description")}
            </p>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1"
            >
              {t("name")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base h-10 rounded-xl bg-muted/30 border-muted-foreground/20 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
              placeholder={t("namePlaceholder") || "e.g. Fresh Milk"}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                {t("quantity")}
              </Label>
              <div className="flex items-center h-10 rounded-xl border border-muted-foreground/20 bg-muted/30 p-1 group focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="h-full px-2 text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-all disabled:opacity-50"
                  type="button"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  value={quantity}
                  min={1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) {
                      setQuantity(0);
                    } else {
                      setQuantity(val);
                    }
                  }}
                  onBlur={() => {
                    if (!quantity || quantity < 1) {
                      setQuantity(1);
                    }
                  }}
                  className="flex-1 w-full h-full bg-transparent text-center font-semibold text-base focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  onClick={() => handleQuantityChange(1)}
                  className="h-full px-2 text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-all"
                  type="button"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                {t("priority")}
              </Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as PriorityType)}
              >
                <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PriorityType.HIGH} className="font-medium">
                    <div className="flex items-center gap-2">
                      {t("priorityType.high")}
                    </div>
                  </SelectItem>
                  <SelectItem
                    value={PriorityType.NORMAL}
                    className=" font-medium"
                  >
                    <div className="flex items-center gap-2">
                      {t("priorityType.normal")}
                    </div>
                  </SelectItem>
                  <SelectItem value={PriorityType.LOW} className=" font-medium">
                    <div className="flex items-center gap-2">
                      {t("priorityType.low")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
              <Tag className="w-3 h-3" />
              {t("category")}
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ShopListCategory)}
            >
              <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ShopListCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "p-1 rounded-md bg-primary/10 text-primary",
                        )}
                      >
                        <CategoryIcon category={cat} />
                      </div>
                      <span className="text-sm">
                        {t(`categoryType.${cat.toLowerCase()}`)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
              <AlignLeft className="w-3 h-3" />
              {t("description")}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px] rounded-xl bg-muted/30 border-muted-foreground/20 resize-none focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-sm"
              placeholder={t("descriptionPlaceholder") || "Details..."}
            />
          </div>
        </div>

        <DialogFooter className="p-4 pt-1 bg-transparent">
          <MotionButton
            onClick={handleSubmit}
            className="w-full h-10 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {t("create")}
          </MotionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
