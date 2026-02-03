"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MButton = motion.create(Button);

type MotionButtonProps = React.ComponentProps<typeof Button> &
  HTMLMotionProps<"button">;

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, disabled, ...props }, ref) => {
    return (
      <MButton
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled}
        className={cn(
          className,
          "transition-colors duration-200",
          "will-change-transform",
          "disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
        )}
        whileTap={disabled ? {} : { scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
          mass: 1,
        }}
        {...props}
      />
    );
  },
);

MotionButton.displayName = "MotionButton";

export default MotionButton;
