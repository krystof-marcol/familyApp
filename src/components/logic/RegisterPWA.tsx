"use client";

import { useEffect } from "react";

export default function RegisterPWA() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("PWA: SW registered"))
        .catch((err) => console.log("PWA: SW failed", err));
    }
  }, []);

  return null;
}
