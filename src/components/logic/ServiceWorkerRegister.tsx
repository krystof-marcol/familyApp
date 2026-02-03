"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("✅ SW Registered. Scope:", reg.scope))
        .catch((err) => console.error("❌ SW Registration Failed:", err));
    }
  }, []);

  return null;
}
