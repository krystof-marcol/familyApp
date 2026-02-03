import React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const selectedRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const times = React.useMemo(() => {
    const result: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        result.push(`${hh}:${mm}`);
      }
    }
    return result;
  }, []);

  React.useEffect(() => {
    if (open && selectedRef.current && scrollRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleTimeSelect = (time: string) => {
    onChange?.(time);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-[120px] justify-start text-left font-normal dark:hover:text-white",
          !value && "text-muted-foreground",
        )}
      >
        <Clock className="mr-2 h-4 w-4" />
        <span className="truncate">{value || "Select time"}</span>
      </Button>

      {open && (
        <div className="absolute mt-1 w-[120px] bg-white border dark:bg-black dark:text-white rounded-md shadow-lg z-50 top-full left-0 overflow-hidden">
          <style>{`
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div ref={scrollRef} className="h-64 overflow-y-auto hide-scrollbar">
            <div className="py-1">
              {times.map((time) => (
                <button
                  key={time}
                  ref={time === value ? selectedRef : null}
                  onClick={() => handleTimeSelect(time)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-100 dark:hover:bg-primary transition-colors rounded-md ${
                    value === time
                      ? "bg-primary  text-white font-semibold"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
