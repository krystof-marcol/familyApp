"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = ["color1", "color2", "color3", "color4", "color5"];

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(value || COLORS[0]);

  const handleSelect = (color: string) => {
    setSelectedColor(color);
    onChange?.(color);
  };

  return (
    <div className="flex items-center gap-3">
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => handleSelect(color)}
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-all",
            selectedColor === color
              ? "border-black dark:border-white scale-110"
              : "border-transparent hover:scale-105",
          )}
          style={{ backgroundColor: `var(--${color})` }}
        />
      ))}
    </div>
  );
}
