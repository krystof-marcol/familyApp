import React, { useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Calendar,
  User,
  AlertCircle,
  Clock,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@apollo/client";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
import { DELETE_HOMEDUTY, GET_HOMEDUTIES } from "@/graphql";
import PopupEvent from "@/app/(protected)/homeduties/popupEvent";
import {
  HomeDutiesListProps,
  OptimisticUpdateProps,
} from "@/app/(protected)/homeduties/HomeDutiesClient";

interface User {
  id: string;
  name: string;
  role: string;
}

interface HomeDutiesProps {
  events: HomeDutiesListProps[];
  familyId: string;
  theme: string;
  assignTo: string;
  users: User[];
  availableUsers: User[];
  onOptimisticDelete: (id: string) => void;
  onOptimisticUpdate: (data: OptimisticUpdateProps) => void;
}

export default function HomeDutiesComponent({
  events,
  familyId,
  assignTo,
  users,
  availableUsers,
  onOptimisticDelete,
  onOptimisticUpdate,
}: HomeDutiesProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [displayEvents, setDisplayEvents] = useState(events);

  const deletedIds = useRef(new Set<string>());

  const t = useTranslations("HomeDuties");
  const isMobile = useIsMobile();
  const [selectedItem, setSelectedItem] = useState<HomeDutiesListProps | null>(
    null,
  );

  const [deleteHomeDuty] = useMutation(DELETE_HOMEDUTY, {
    refetchQueries: [{ query: GET_HOMEDUTIES, variables: { familyId } }],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    setDisplayEvents(events.filter((e) => !deletedIds.current.has(e.id)));
  }, [events]);

  const filteredEvents = useMemo(() => {
    return displayEvents
      .filter((e) => assignTo === "all" || e.assignTo === assignTo)
      .sort((a, b) => {
        const dateA = new Date(Number(a.dueTo)).getTime();
        const dateB = new Date(Number(b.dueTo)).getTime();
        return dateA - dateB;
      });
  }, [displayEvents, assignTo]);

  const handleComplete = async (id: string) => {
    deletedIds.current.add(id);
    setCompleted((prev) => ({ ...prev, [id]: true }));

    setTimeout(() => {
      onOptimisticDelete(id);
    }, 300);

    setTimeout(async () => {
      try {
        await deleteHomeDuty({ variables: { id } });
      } catch (e) {
        console.error("Failed to delete home duty", e);
      }
    }, 0);
  };

  const getRealName = (id: string) => {
    if (id === "all") return "All";
    const user = users.find((u) => u.id === id);
    return user ? user.name : "Unknown";
  };

  const getDays = (dueTo: string) => {
    const dueDate = new Date(Number(dueTo));
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDueDateBadge = (days: number) => {
    if (days < 0) {
      return {
        variant: "destructive" as const,
        text: `${Math.abs(days)}d ${t("overdue")}`,
        icon: AlertCircle,
      };
    } else if (days === 0) {
      return {
        variant: "default" as const,
        text: `${t("popupWindow.today")}`,
        icon: Clock,
      };
    } else if (days === 1) {
      return {
        variant: "secondary" as const,
        text: `${t("popupWindow.tomorrow")}`,
        icon: Calendar,
      };
    } else {
      return {
        variant: "outline" as const,
        text: `${days} ${t("days")}`,
        icon: Calendar,
      };
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueEvents = filteredEvents.filter(
    (e) => new Date(Number(e.dueTo)) < today,
  );
  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(Number(e.dueTo)) >= today,
  );

  const allEventsWithDivider = [
    ...overdueEvents,
    ...(overdueEvents.length > 0 && upcomingEvents.length > 0
      ? [{ id: "divider" } as HomeDutiesListProps]
      : []),
    ...upcomingEvents,
  ];

  return (
    <>
      <PopupEvent
        open={!!selectedItem}
        setOpen={(open) => {
          if (!open) setSelectedItem(null);
        }}
        description={selectedItem?.description ?? ""}
        name={selectedItem?.name ?? ""}
        assignTo={selectedItem?.assignTo ?? ""}
        dueTo={selectedItem?.dueTo ?? ""}
        id={selectedItem?.id ?? ""}
        familyId={familyId}
        availableUsers={availableUsers}
        onOptimisticDelete={onOptimisticDelete}
        onOptimisticUpdate={onOptimisticUpdate}
      />

      <Card className="w-full mx-auto mt-2 rounded-2xl shadow-lg border-2 max-h-[calc(100vh-2rem)] overflow-hidden">
        <CardContent className="p-4 h-full overflow-hidden">
          <ScrollArea className="h-[calc(66vh-2rem-2rem-2rem)] pr-2">
            <ul className="space-y-3 pb-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredEvents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center h-full w-full py-12 text-center"
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
                  allEventsWithDivider.map((item) =>
                    item.id === "divider" ? (
                      <motion.div
                        key="divider"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative py-3"
                      >
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t-2 border-primary/30"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-background px-3 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                            {t("upcoming")} <ArrowDown className="w-3 h-3" />
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
                            relative rounded-xl border-2 transition-all duration-300 overflow-hidden
                            ${
                              completed[item.id]
                                ? "bg-muted/30 border-muted"
                                : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                            }
                            ${
                              getDays(item.dueTo) < 0 && !completed[item.id]
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
                            className="absolute left-4 right-4 top-1/2 h-[2px] bg-primary origin-left z-10 pointer-events-none"
                          />

                          <div className="flex items-start p-4 gap-3 relative">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              whileHover={{ scale: 1.1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!completed[item.id]) {
                                  handleComplete(item.id);
                                }
                              }}
                              className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-full cursor-pointer z-20"
                            >
                              {completed[item.id] ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  <CheckCircle2
                                    className="text-primary"
                                    size={24}
                                  />
                                </motion.div>
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
                                isMobile ? "grid-cols-2" : "grid-cols-3"
                              }`}
                            >
                              <div className="relative text-center">
                                <motion.h3
                                  animate={{
                                    color: completed[item.id]
                                      ? "#808080"
                                      : "currentColor",
                                  }}
                                  className="font-semibold text-sm truncate px-1"
                                >
                                  {item.name}
                                </motion.h3>
                              </div>

                              {!isMobile && (
                                <div className="text-center">
                                  <Badge
                                    variant="secondary"
                                    className="inline-flex items-center gap-1.5 font-normal"
                                  >
                                    <User className="w-3 h-3" />
                                    <span className="text-xs">
                                      {getRealName(item.assignTo)}
                                    </span>
                                  </Badge>
                                </div>
                              )}

                              <div className="text-center">
                                {(() => {
                                  const days = getDays(item.dueTo);
                                  const badgeInfo = getDueDateBadge(days);
                                  const Icon = badgeInfo.icon;
                                  return (
                                    <Badge
                                      variant={badgeInfo.variant}
                                      className="inline-flex items-center gap-1.5 font-normal"
                                    >
                                      <Icon className="w-3 h-3" />
                                      <span className="text-xs">
                                        {badgeInfo.text}
                                      </span>
                                    </Badge>
                                  );
                                })()}
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
