"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Calendar,
  BrushCleaning,
  HandCoins,
  ShoppingBasket,
  Settings as SettingsIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function MobileNav({ familyId }: { familyId: string }) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const queryClient = useQueryClient();

  const [optimisticPath, setOptimisticPath] = useState(pathname);

  useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  const prefetchRoute = (url: string) => {
    if (!familyId) return;

    if (url === "/shoplist") {
      queryClient.prefetchQuery({
        queryKey: ["shoppingList", familyId],
        queryFn: async () => {
          const res = await fetch(`/api/shop-list?familyId=${familyId}`);
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        },
        staleTime: 60 * 1000,
      });
    }

    if (url === "/calendar") {
      queryClient.prefetchQuery({
        queryKey: ["calendarList", familyId],
        queryFn: async () => {
          const res = await fetch(`/api/calendar?familyId=${familyId}`);
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        },
        staleTime: 60 * 1000,
      });
    }

    if (url === "/expenses") {
      queryClient.prefetchQuery({
        queryKey: ["expenseList", familyId],
        queryFn: async () => {
          const res = await fetch(`/api/expenses?familyId=${familyId}`);
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        },
        staleTime: 60 * 1000,
      });
    }
    if (url === "/homeduties") {
      queryClient.prefetchQuery({
        queryKey: ["homeDutiesList", familyId],
        queryFn: async () => {
          const res = await fetch(`/api/home-chores?familyId=${familyId}`);
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        },
        staleTime: 60 * 1000,
      });
    }
  };

  const items = [
    { title: "", url: "/shoplist", icon: ShoppingBasket },
    { title: "", url: "/homeduties", icon: BrushCleaning },
    { title: "", url: "/calendar", icon: Calendar },
    { title: "", url: "/expenses", icon: HandCoins },
    { title: "", url: "/settings", icon: SettingsIcon },
  ];

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full z-50",
        "bg-white dark:bg-zinc-950",
        "border-t border-gray-200 dark:border-zinc-800",
        "md:hidden",
        "pb-[env(safe-area-inset-bottom)]",
        "touch-none",
      )}
    >
      <div className="grid h-18 grid-cols-5 pl-3 pr-3 mx-auto w-full max-w-md">
        {items.map((item) => {
          const isActive = optimisticPath === item.url;

          return (
            <Link
              key={item.url}
              href={item.url}
              onClick={() => setOptimisticPath(item.url)}
              onTouchStart={() => prefetchRoute(item.url)}
              onMouseEnter={() => prefetchRoute(item.url)}
              className="inline-flex flex-col items-center justify-center w-full h-full active:scale-95 transition-transform duration-100"
            >
              <div
                className={cn(
                  "flex items-center justify-center mb-1 transition-all duration-200",
                  "w-10 h-10",
                  isActive
                    ? "border-2 border-primary rounded-xl text-primary dark:text-primary bg-primary/5"
                    : "border-2 border-transparent text-gray-500 dark:text-gray-400",
                )}
              >
                <item.icon className="w-6 h-6" />
              </div>

              <span
                className={cn(
                  "text-[10px] font-medium leading-none truncate w-full text-center transition-colors duration-200",
                  isActive
                    ? "text-primary dark:text-primary"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
