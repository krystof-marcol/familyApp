"use client";

import { useEffect } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useSession } from "next-auth/react";

interface UsePageTutorialProps {
  tutorialId: string;
  steps: DriveStep[];
}

export function usePageTutorial({ tutorialId, steps }: UsePageTutorialProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const storageKey = `user_${userId}_tutorial_seen_${tutorialId}`;

    const hasSeen = localStorage.getItem(storageKey);

    if (hasSeen) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      popoverClass: "driverjs-theme",
      steps: steps,

      onDestroyStarted: () => {
        localStorage.setItem(storageKey, "true");
        driverObj.destroy();
      },
    });

    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [tutorialId, steps, userId]);
}
