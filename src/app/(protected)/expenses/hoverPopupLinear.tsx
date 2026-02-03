import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    name: string;
    color: string;
  }[];
  label?: string;
  currency?: string;
}

export default function CustomTooltip({
  active,
  payload,
  label,
  currency,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <Card
      className={cn(
        "border border-border/50 bg-background/80 backdrop-blur-sm shadow-md rounded-xl p-2",
        "transition-all duration-150",
      )}
    >
      <CardContent className="p-2 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">📅 {label}</p>
        <ul className="space-y-1">
          {payload.map((entry, index) => (
            <li key={`item-${index}`} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-semibold text-foreground">
                {entry.name}:
              </span>
              <span className="text-sm text-muted-foreground">
                {entry.value.toLocaleString()} {currency}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
