"use client";

import {
  Calendar,
  BrushCleaning,
  HandCoins,
  ShoppingBasket,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppAvatar } from "@/components/app-avatar";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

interface SidebarProps {
  imageUrl: string;
  familyName: string;
  familyId: string;
  userName?: string;
}

export function AppSidebar({
  familyName,
  familyId,
  imageUrl,
  userName = "Guest",
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const items = [
    { title: t("calendar"), url: "/calendar", icon: Calendar },
    { title: t("shoppingList"), url: "/shoplist", icon: ShoppingBasket },
    { title: t("homeDuties"), url: "/homeduties", icon: BrushCleaning },
    { title: t("expenses"), url: "/expenses", icon: HandCoins },
    { title: t("settings"), url: "/settings", icon: SettingsIcon },
  ];

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

  const handleDropdownNavigation = (url: string) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    router.push(url);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sections")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname?.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.url}
                        className="w-full flex items-center gap-3"
                        onMouseEnter={() => prefetchRoute(item.url)}
                        onTouchStart={() => prefetchRoute(item.url)}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-full dark:hover:bg-dark-purple hover:bg-gray-100 transition-shadow cursor-pointer mb-5">
              <AppAvatar imageUrl={imageUrl} />
              <div className="flex flex-col text-left overflow-hidden whitespace-nowrap">
                <span className=" text-sm font-medium text-gray-900 dark:text-white">
                  {userName}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {familyName}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{t("account")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDropdownNavigation("/family")}
            >
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDropdownNavigation("/settings")}
            >
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDropdownNavigation("/donate")}
            >
              {t("donate")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
                signOut({ callbackUrl: "/auth/login" });
              }}
            >
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
