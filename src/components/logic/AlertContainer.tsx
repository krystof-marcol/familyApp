"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "./AlertProvider";

export function AlertContainer() {
  const { alerts, removeAlert } = useAlert();

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-500 flex flex-col items-center space-y-3 pointer-events-none">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-xl text-center min-w-[300px] max-w-[90vw] backdrop-blur-sm pointer-events-auto"
          >
            <div className="flex items-center justify-between space-x-3">
              <span className="flex-1 text-sm font-medium">
                {alert.message}
              </span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
