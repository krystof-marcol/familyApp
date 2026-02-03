import React from "react";
import { EventContentArg } from "@fullcalendar/core";
import { cn } from "@/lib/utils";

interface CustomEventProps {
  event: EventContentArg["event"];
  language: "en" | "cz";
  isWeekView: boolean;
  color?: string;
  onEventClick: (event: EventContentArg["event"]) => void;
}

const CustomEvent: React.FC<CustomEventProps> = ({
  event,
  language,
  isWeekView,
  color = "color1",
  onEventClick,
}) => {
  const formatTime = (date?: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString(language === "cz" ? "cs-CZ" : "en-US", {
      hour: language === "en" ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: language === "en",
    });
  };

  const startTime = formatTime(event.start);
  const endTime = formatTime(event.end);
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : "";

  const baseColorVar = `var(--${color})`;

  const dynamicStyle: React.CSSProperties = {
    backgroundColor: `color-mix(in srgb, ${baseColorVar} 15%, transparent)`,
    color: baseColorVar,
    borderLeft: `4px solid color-mix(in srgb, ${baseColorVar}, black 20%)`,
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
      style={dynamicStyle}
      className={cn(
        "w-full h-full cursor-pointer select-none overflow-hidden",
        "rounded-md",
        "shadow-sm transition-all duration-200 ease-in-out",
        "hover:bg-opacity-30 hover:shadow-md hover:scale-[1.01] hover:z-50",
        isWeekView ? "flex flex-col p-1.5" : "flex items-center px-2 py-0.5",
      )}
    >
      {isWeekView ? (
        <div className="flex flex-col items-start justify-start w-full gap-0.5">
          <span className="text-sm font-bold leading-tight whitespace-normal break-words text-left">
            {event.title}
          </span>

          <span className="text-[11px] font-semibold opacity-80">
            {timeRange}
          </span>

          {event.extendedProps?.description && (
            <span className="text-[10px] font-medium opacity-70 mt-1 line-clamp-2 leading-tight text-left">
              {event.extendedProps.description}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs font-bold truncate flex-1 text-left">
            {event.title}
          </span>
          <span className="text-[10px] font-semibold opacity-80 hidden sm:block whitespace-nowrap">
            {startTime}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomEvent;
