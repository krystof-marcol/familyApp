import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
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
import { UPDATE_SHOPLIST, DELETE_SHOPLIST, GET_SHOPLISTS } from "@/graphql";
import { useAlert } from "@/components/logic/AlertProvider";
import { PriorityType, ShopListCategory } from "@prisma/client";
import MotionButton from "@/components/ui/motion-button";

type OptimisticUpdateProps = Partial<ShopListProps> & { id: string };

type ShopListProps = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: ShopListCategory;
  priority: PriorityType;
};

interface PopupWindowProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  familyId: string;
  priority: string;
  category: string;
  description?: string;
  name: string;
  quantity?: number;
  id: string;
  onOptimisticUpdate: (data: OptimisticUpdateProps) => void;
  onOptimisticDelete: (id: string) => void;
}

export default function PopupEvent(props: PopupWindowProps) {
  const t = useTranslations("ShopList");
  const { showAlert } = useAlert();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ShopListCategory>(
    ShopListCategory.FOOD,
  );
  const [priority, setPriority] = useState<PriorityType>(PriorityType.NORMAL);
  const [quantity, setQuantity] = useState(1);

  const initialName = props.name;
  const initialDescription = props.description || "";
  const initialCategory = props.category as ShopListCategory;
  const initialPriority = props.priority as PriorityType;
  const initialQuantity = props.quantity || 1;

  const [updateShopList] = useMutation(UPDATE_SHOPLIST, {
    refetchQueries: [
      {
        query: GET_SHOPLISTS,
        variables: { familyId: props.familyId },
      },
    ],
    awaitRefetchQueries: true,
  });

  const [deleteShopList] = useMutation(DELETE_SHOPLIST, {
    refetchQueries: [
      {
        query: GET_SHOPLISTS,
        variables: { familyId: props.familyId },
      },
    ],
    awaitRefetchQueries: true,
  });

  const hasChanges =
    name !== initialName ||
    description !== initialDescription ||
    category !== initialCategory ||
    priority !== initialPriority ||
    quantity !== initialQuantity;

  const handleSave = async () => {
    const tempId = props.id;
    const optimisticFakeData = {
      id: tempId,
      name: name,
      description: description,
      category: category,
      priority: priority,
      quantity: quantity,
    };
    props.onOptimisticUpdate(optimisticFakeData);
    props.setOpen(false);
    setTimeout(async () => {
      try {
        await updateShopList({
          variables: {
            input: {
              id: props.id,
              name,
              description,
              category,
              priority,
              quantity: Number(quantity),
            },
          },
        });

        showAlert(t("updateMessage"));
      } catch (err) {
        console.error(err);
        showAlert(`${err}`);
      }
    }, 0);
  };

  const handleDelete = async () => {
    props.onOptimisticDelete(props.id);
    props.setOpen(false);
    setTimeout(async () => {
      try {
        await deleteShopList({
          variables: {
            id: props.id,
          },
        });
        showAlert(t("deleteMessage"));
      } catch (err) {
        console.error(err);
        showAlert(`${err}`);
      }
    });
  };

  const handleClose = () => {
    props.setOpen(false);
    setName("");
    setDescription("");
    setCategory(ShopListCategory.FOOD);
    setPriority(PriorityType.NORMAL);
    setQuantity(1);
  };

  useEffect(() => {
    setName(props.name || "");
    setDescription(props.description || "");
    setCategory((props.category as ShopListCategory) || ShopListCategory.FOOD);
    setPriority((props.priority as PriorityType) || PriorityType.NORMAL);
    setQuantity(props.quantity || 1);
  }, [
    props.name,
    props.description,
    props.category,
    props.priority,
    props.quantity,
  ]);

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-md w-[95vw] p-0 gap-0 max-h-[90dvh] overflow-y-auto block">
        <div className="px-6 pt-6 pb-4 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          ></button>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("name")}
            className="text-lg font-semibold border-0 border-b rounded-sm w-full"
          />
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              {t("description")}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("categoryName")}
              </span>
              <Select
                value={category}
                onValueChange={(value) =>
                  setCategory(value as ShopListCategory)
                }
              >
                <SelectTrigger className="w-[50%] text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ShopListCategory.FOOD}>
                    {t("category.FOOD")}
                  </SelectItem>
                  <SelectItem value={ShopListCategory.CLOTHES}>
                    {t("category.CLOTHES")}
                  </SelectItem>
                  <SelectItem value={ShopListCategory.ENTERTAINMENT}>
                    {t("category.ENTERTAINMENT")}
                  </SelectItem>
                  <SelectItem value={ShopListCategory.HEALTH}>
                    {t("category.HEALTH")}
                  </SelectItem>
                  <SelectItem value={ShopListCategory.HOUSE}>
                    {t("category.HOUSE")}
                  </SelectItem>
                  <SelectItem value={ShopListCategory.OTHER}>
                    {t("category.OTHER")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("priorityName")}
              </span>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as PriorityType)}
              >
                <SelectTrigger className="w-[50%] text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PriorityType.HIGH}>
                    {t("priority.HIGH")}
                  </SelectItem>
                  <SelectItem value={PriorityType.NORMAL}>
                    {t("priority.NORMAL")}
                  </SelectItem>
                  <SelectItem value={PriorityType.LOW}>
                    {t("priority.LOW")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("quantity")}
              </span>
              <Input
                type="number"
                min="1"
                inputMode="decimal"
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-[50%] text-sm md:text-base"
              />
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
