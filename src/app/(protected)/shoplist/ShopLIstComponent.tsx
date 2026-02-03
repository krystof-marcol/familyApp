import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Circle,
  CheckCircle2,
  Package,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DELETE_SHOPLIST, GET_SHOPLISTS } from "@/graphql";
import { useMutation } from "@apollo/client";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
import PopupEvent from "@/app/(protected)/shoplist/popupEvent";
import { PriorityType, ShopListCategory } from "@prisma/client";

type OptimisticUpdateProps = Partial<ShopListProps> & { id: string };

interface ShopListComponentProps {
  events: ShopListProps[];
  familyId: string;
  theme: string;
  category: string;
  priority: string;
  onOptimisticUpdate: (data: OptimisticUpdateProps) => void;
  onOptimisticDelete: (id: string) => void;
}
type ShopListProps = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: ShopListCategory;
  priority: PriorityType;
};

export default function ShopListComponent({
  events,
  familyId,
  category,
  priority,
  onOptimisticUpdate,
  onOptimisticDelete,
}: ShopListComponentProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [displayEvents, setDisplayEvents] = useState(events);

  const deletedIds = useRef(new Set<string>());

  const t = useTranslations("ShopList");
  const isMobile = useIsMobile();
  const [selectedItem, setSelectedItem] = useState<ShopListProps | null>(null);

  const [deleteShopList] = useMutation(DELETE_SHOPLIST, {
    refetchQueries: [{ query: GET_SHOPLISTS, variables: { familyId } }],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    setDisplayEvents(events.filter((e) => !deletedIds.current.has(e.id)));
  }, [events]);

  const filteredEvents = useMemo(() => {
    return displayEvents
      .filter((e) => {
        const matchCategory =
          category.toLowerCase() === "all" ||
          e.category.toLowerCase() === category.toLowerCase();

        const matchPriority =
          priority.toLowerCase() === "all" ||
          e.priority.toLowerCase() === priority.toLowerCase();

        return matchCategory && matchPriority;
      })
      .sort((a, b) => {
        const priorityOrder = { HIGH: 0, NORMAL: 1, LOW: 2 };
        const aPriority =
          priorityOrder[
            a.priority.toUpperCase() as keyof typeof priorityOrder
          ] ?? 3;
        const bPriority =
          priorityOrder[
            b.priority.toUpperCase() as keyof typeof priorityOrder
          ] ?? 3;
        return aPriority - bPriority;
      });
  }, [displayEvents, category, priority]);

  const handleComplete = async (id: string) => {
    deletedIds.current.add(id);
    setCompleted((prev) => ({ ...prev, [id]: true }));

    setTimeout(() => {
      onOptimisticDelete(id);
    }, 300);

    setTimeout(async () => {
      try {
        await deleteShopList({ variables: { id } });
      } catch (e) {
        console.error(e);
      }
    }, 0);
  };

  const getPriorityBadge = (priorityValue: string) => {
    switch (priorityValue.toUpperCase()) {
      case "HIGH":
        return { variant: "destructive" as const, icon: AlertTriangle };
      case "NORMAL":
        return { variant: "secondary" as const, icon: Package };
      case "LOW":
        return { variant: "outline" as const, icon: Package };
      default:
        return { variant: "outline" as const, icon: Package };
    }
  };

  const highPriorityItems = filteredEvents.filter(
    (e) => e.priority.toUpperCase() === "HIGH",
  );
  const otherItems = filteredEvents.filter(
    (e) => e.priority.toUpperCase() !== "HIGH",
  );

  const allItemsWithDivider = [
    ...highPriorityItems,
    ...(highPriorityItems.length > 0 && otherItems.length > 0
      ? [{ id: "divider" } as ShopListProps]
      : []),
    ...otherItems,
  ];

  return (
    <>
      <PopupEvent
        open={!!selectedItem}
        setOpen={(open) => {
          if (!open) setSelectedItem(null);
        }}
        category={selectedItem?.category ?? ""}
        priority={selectedItem?.priority ?? ""}
        description={selectedItem?.description ?? ""}
        name={selectedItem?.name ?? ""}
        quantity={selectedItem?.quantity ?? 0}
        id={selectedItem?.id ?? ""}
        familyId={familyId}
        onOptimisticUpdate={onOptimisticUpdate}
        onOptimisticDelete={onOptimisticDelete}
      />

      <Card className="w-full mx-auto mt-2 rounded-2xl shadow-lg border-2 max-h-[calc(100vh-2rem)] overflow-hidden">
        <CardContent className="p-4 h-full overflow-hidden">
          <ScrollArea className="h-[calc(66vh-2rem-2rem-2rem)] pr-2">
            <ul className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredEvents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-primary">
                      {t("noItem")}
                    </p>
                    <p className="text-sm text-primary/60 mt-1">
                      {t("allCompleted")}!
                    </p>
                  </motion.div>
                ) : (
                  allItemsWithDivider.map((item) =>
                    item.id === "divider" ? (
                      <motion.div
                        key="divider"
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative py-3"
                      >
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t-2 border-primary/30"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-background px-3 text-xs font-semibold text-primary uppercase tracking-wider">
                            {t("normalPriority")}
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.li
                        key={item.id}
                        layout="position"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          x: -100,
                          height: 0,
                          marginBottom: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          layout: { duration: 0.2 },
                        }}
                        className="relative"
                      >
                        <div
                          className={`
                            relative rounded-xl border-2 transition-all duration-300
                            ${
                              completed[item.id]
                                ? "bg-muted/30 border-muted"
                                : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                            }
                            ${
                              item.priority.toUpperCase() === "HIGH" &&
                              !completed[item.id]
                                ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
                                : ""
                            }
                          `}
                        >
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{
                              scaleX: completed[item.id] ? 1 : 0,
                            }}
                            transition={{
                              duration: 0.25,
                              ease: "easeInOut",
                            }}
                            className="absolute left-4 right-4 top-1/2 h-[2px] bg-primary origin-left z-10"
                          />

                          <div className="flex items-start p-4 gap-3 relative">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              whileHover={{ scale: 1.1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComplete(item.id);
                              }}
                              className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                            >
                              {completed[item.id] ? (
                                <CheckCircle2
                                  className="text-primary"
                                  size={24}
                                />
                              ) : (
                                <Circle
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                  size={24}
                                />
                              )}
                            </motion.button>

                            <div
                              onClick={() => setSelectedItem(item)}
                              className={`flex-1 cursor-pointer grid items-center gap-2 ${
                                isMobile ? "grid-cols-2" : "grid-cols-4"
                              }`}
                            >
                              <div className="relative text-center">
                                <motion.h3
                                  animate={{
                                    color: completed[item.id]
                                      ? "#808080"
                                      : "currentColor",
                                  }}
                                  className="font-semibold text-sm"
                                >
                                  {item.name}
                                </motion.h3>
                              </div>

                              {!isMobile && (
                                <>
                                  <div className="text-center">
                                    <Badge
                                      variant="secondary"
                                      className="inline-flex items-center gap-1.5 font-normal"
                                    >
                                      <Package className="w-3 h-3" />
                                      <span className="text-xs">
                                        {item.category
                                          ? t(`category.${item.category}`)
                                          : "-"}
                                      </span>
                                    </Badge>
                                  </div>

                                  <div className="text-center">
                                    {(() => {
                                      const badgeInfo = getPriorityBadge(
                                        item.priority,
                                      );
                                      const Icon = badgeInfo.icon;
                                      return (
                                        <Badge
                                          variant={badgeInfo.variant}
                                          className="inline-flex items-center gap-1.5 font-normal"
                                        >
                                          <Icon className="w-3 h-3" />
                                          <span className="text-xs">
                                            {item.priority
                                              ? t(`priority.${item.priority}`)
                                              : "-"}
                                          </span>
                                        </Badge>
                                      );
                                    })()}
                                  </div>
                                </>
                              )}

                              <div className="text-center">
                                <Badge
                                  variant="outline"
                                  className="inline-flex items-center gap-1.5 font-normal"
                                >
                                  <Layers className="w-3 h-3" />
                                  <span className="text-xs font-medium">
                                    {item.quantity ?? "-"}
                                  </span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ),
                  )
                )}
              </AnimatePresence>
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
