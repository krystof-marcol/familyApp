import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { curveMonotoneX } from "d3-shape";
import { Currency } from "@prisma/client";
import CustomTooltip from "@/app/(protected)/expenses/hoverPopupLinear";
import { useTranslations } from "next-intl";

interface LinearGraphProps {
  data: {
    amount: string;
    date: Date;
    currency: Currency;
    user: {
      id: string;
      name: string;
    };
  }[];
  currency: Currency;
  timeFrame: string;
  selectedUser: string;
}

export default function LinearGraph({
  data,
  currency,
  timeFrame,
  selectedUser,
}: LinearGraphProps) {
  const t = useTranslations("Expenses");

  const groupedByDate = useMemo(() => {
    const acc: Record<string, Record<string, number>> = {};
    const now = new Date();
    const cutoff = new Date(now);

    switch (timeFrame) {
      case "week":
        cutoff.setDate(now.getDate() - 8);
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

    const filteredData = data.filter((item) => {
      const d = new Date(Number(item.date) || item.date);
      return d >= cutoff && d <= now;
    });

    const filteredDataByUser = filteredData.filter((item) => {
      if (selectedUser === "all") return true;
      return item.user.id === selectedUser;
    });

    filteredDataByUser.forEach((item) => {
      const d = new Date(Number(item.date) || item.date);
      const formattedDate = `${d.getDate()}.${d.getMonth() + 1}.${d
        .getFullYear()
        .toString()
        .slice(2)}`;

      const userId = item.user.id;

      if (!acc[formattedDate]) acc[formattedDate] = {};
      if (!acc[formattedDate][userId]) acc[formattedDate][userId] = 0;

      acc[formattedDate][userId] += Number(item.amount);
    });

    return acc;
  }, [data, timeFrame, selectedUser]);

  const dataFormatted = useMemo(() => {
    const entries = Object.entries(groupedByDate);
    const users = Array.from(new Set(data.map((d) => d.user.id)));

    return entries
      .map(([date, usersData]) => {
        const entry: Record<string, number | string> = { date };
        users.forEach((u) => {
          entry[u] = usersData[u] ? usersData[u] : 0;
        });
        return entry;
      })
      .sort((a, b) => {
        const [dA, mA, yA] = (a.date as string).split(".").map(Number);
        const [dB, mB, yB] = (b.date as string).split(".").map(Number);
        return (
          new Date(2000 + yA, mA - 1, dA).getTime() -
          new Date(2000 + yB, mB - 1, dB).getTime()
        );
      });
  }, [groupedByDate, data]);

  const users = useMemo(() => {
    const unique: { id: string; name: string }[] = [];
    const seen = new Set();
    data.forEach((d) => {
      if (!seen.has(d.user.id)) {
        seen.add(d.user.id);
        unique.push({ id: d.user.id, name: d.user.name });
      }
    });
    return unique;
  }, [data]);

  const colors = [
    "var(--color_graph1)",
    "var(--color_graph2)",
    "var(--color_graph3)",
    "var(--color_graph4)",
    "var(--color_graph5)",
  ];

  if (dataFormatted.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <p className="text-muted-foreground text-sm">
          {t("empty") || "Nothing in list"}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="99%" height="100%">
      <AreaChart
        data={dataFormatted}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          minTickGap={40}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, "auto"]}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => String((v as number) ?? 0)}
        />

        <Tooltip
          content={<CustomTooltip currency={currency} />}
          wrapperStyle={{ zIndex: 100 }}
          filterNull={true}
        />

        {users
          .filter((user) => selectedUser === "all" || user.id === selectedUser)
          .map((user, index) => (
            <Area
              key={user.id}
              type={curveMonotoneX}
              dataKey={user.id}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.8}
              strokeWidth={3}
              name={user.name}
              stackId="1"
            />
          ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
