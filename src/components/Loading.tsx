"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Home, Users } from "lucide-react";

export default function FamilyLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div
      suppressHydrationWarning
      className={
        "fixed inset-0 flex flex-col items-center justify-center bg-transparent  z-50"
      }
    >
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="absolute -left-10"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <Users size={40} className="text-blue-600 dark:text-blue-400" />
        </motion.div>

        <motion.div
          className="absolute"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Heart size={50} className="text-pink-500 dark:text-pink-400" />
        </motion.div>

        <motion.div
          className="absolute left-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <Home size={40} className="text-yellow-500 dark:text-yellow-400" />
        </motion.div>
      </motion.div>

      <motion.p
        className="mt-20 text-lg font-medium text-gray-700 dark:text-gray-200"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        Building your family space...
      </motion.p>
    </div>
  );
}
