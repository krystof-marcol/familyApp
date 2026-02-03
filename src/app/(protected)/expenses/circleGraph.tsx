import React, { useState, useMemo, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Currency } from "@prisma/client";
import { useTranslations } from "next-intl";

interface CategoryData {
  name: string;
  amount: number | string;
  category: string;
  date: string | Date;
  user: {
    id: string;
    name: string;
  };
}

interface CircleGraphProps {
  data: CategoryData[];
  currency: Currency;
  timeFrame: string;
  selectedUser: string;
}

const COLORS = [
  "var(--color_graph1)",
  "var(--color_graph2)",
  "var(--color_graph3)",
  "var(--color_graph4)",
  "var(--color_graph5)",
  "var(--color_graph6)",
  "var(--color_graph7)",
];

export default function DonutChart(dataProps: CircleGraphProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const t = useTranslations("Expenses");

  const groupedData = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    const cutoff = new Date(now);

    switch (dataProps.timeFrame) {
      case "week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "year":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoff.setMonth(now.getMonth() - 1);
    }
    cutoff.setHours(0, 0, 0, 0);

    for (const item of dataProps.data) {
      const dateVal = item.date;
      const itemDate =
        dateVal instanceof Date
          ? dateVal
          : !isNaN(Number(dateVal))
            ? new Date(Number(dateVal))
            : new Date(dateVal);

      if (
        itemDate >= cutoff &&
        (dataProps.selectedUser === "all" ||
          item.user.id === dataProps.selectedUser)
      ) {
        const amountStr = item.amount.toString().replace(",", ".");
        const safeAmount = Number(amountStr);
        if (!isNaN(safeAmount)) {
          map.set(item.category, (map.get(item.category) || 0) + safeAmount);
        }
      }
    }
    return Array.from(map.entries()).map(([category, total]) => ({
      category,
      value: total,
    }));
  }, [
    dataProps.data,
    dataProps.selectedUser,
    dataProps.timeFrame,
    activeIndex,
  ]);

  useEffect(() => {
    if (!containerRef.current) return;
    const initialWidth = Math.round(containerRef.current.offsetWidth);
    setContainerWidth(initialWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.round(entry.contentRect.width);
        setContainerWidth(newWidth);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [groupedData]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    groupedData.forEach((item, index) => {
      map[item.category] = COLORS[index % COLORS.length];
    });
    return map;
  }, [groupedData]);

  const activeItem =
    activeIndex !== undefined && groupedData[activeIndex]
      ? groupedData[activeIndex]
      : groupedData[0];

  const isNarrow = containerWidth > 0 && containerWidth < 350;

  if (groupedData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <p className="text-muted-foreground text-sm">
          {t("empty") || "Nothing in list"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
    >
      <div
        className={`flex items-center justify-center transition-all duration-300 ${
          isNarrow ? "flex-col gap-4" : "flex-row gap-6"
        }`}
      >
        <div
          className={`relative flex-shrink-0 ${
            isNarrow
              ? "w-[200px] h-[200px]"
              : "w-[220px] h-[220px] sm:w-[240px] sm:h-[240px]"
          }`}
          onMouseLeave={() => setActiveIndex(undefined)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={groupedData}
                innerRadius="78%"
                outerRadius="92%"
                dataKey="value"
                nameKey="category"
                isAnimationActive={false}
                onMouseEnter={(_, i) => setActiveIndex(i)}
                paddingAngle={2}
              >
                {groupedData.map((entry, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColorMap[entry.category]}
                      stroke="var(--background)"
                      strokeWidth={2}
                      style={{
                        transform: isActive ? "scale(1.075)" : "scale(1)",
                        transformBox: "view-box",
                        transformOrigin: "center",
                        transition: "all 0.3s ease",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {activeItem && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-[68%] h-[68%] rounded-full bg-[var(--color_circle_shadow)] bg-opacity-20 border-2 border-[var(--background_circle)] shadow-sm backdrop-blur-sm flex flex-col items-center justify-center text-center p-2">
                <p className="text-[10px] sm:text-xs text-[var(--background_circle)] truncate w-full px-1">
                  {t(`category.${activeItem.category}`)}
                </p>
                <p className="text-sm sm:text-lg font-bold text-white truncate max-w-full px-1">
                  {activeItem.value.toFixed(0)}
                </p>
                <span className="text-muted-foreground dark:text-black text-[10px]">
                  {dataProps.currency}
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex ${
            isNarrow
              ? "flex-wrap justify-center w-full gap-x-3 gap-y-2"
              : "flex-col items-start gap-2 min-w-[120px]"
          }`}
        >
          {groupedData.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 cursor-pointer select-none group"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              onClick={() => setActiveIndex(index)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
                style={{
                  backgroundColor: categoryColorMap[item.category],
                  opacity: activeIndex === index ? 1 : 0.7,
                  transform: activeIndex === index ? "scale(1.2)" : "scale(1)",
                }}
              />
              <span
                className={`truncate text-xs sm:text-sm transition-opacity ${
                  activeIndex === index
                    ? "font-semibold opacity-100"
                    : "font-normal opacity-80"
                }`}
              >
                {t(`category.${item.category}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
