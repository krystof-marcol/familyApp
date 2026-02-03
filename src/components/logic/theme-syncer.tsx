"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

export function ThemeSyncer() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();

  const userTheme = session?.user.colorTheme;

  useEffect(() => {
    if (userTheme) {
      setTheme(userTheme);
    }
  }, [userTheme, setTheme]);

  return null;
}
