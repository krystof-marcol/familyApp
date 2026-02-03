"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Alert = {
  id: string;
  message: string;
};

type AlertContextType = {
  alerts: Alert[];
  showAlert: (message: string) => void;
  removeAlert: (id: string) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = (message: string) => {
    const id = crypto.randomUUID();
    setAlerts((prev) => [...prev, { id, message }]);

    // Auto-remove after 3.5 seconds
    setTimeout(() => removeAlert(id), 3500);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within an AlertProvider");
  return ctx;
}
