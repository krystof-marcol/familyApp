"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppAvatar } from "@/components/app-avatar";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface HeaderProps {
  disabled: boolean;
  imageUrl: string;
}

export function Header({ disabled, imageUrl }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Header");

  const { toggleSidebar } = useSidebar();

  const isLockedPage =
    pathname === "/family-selection" || pathname === "/get-started";

  const isMenuDisabled = isLockedPage;
  const isProfileDisabled = disabled || isLockedPage;

  return (
    <header
      className="
        flex items-center h-14 border-b bg-background relative z-40
        px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]
        shrink-0
      "
    >
      <div className="hidden min-[500px]:flex items-center">
        <Button
          id="menu-sidebar-button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 relative z-50"
          onClick={toggleSidebar}
          disabled={isMenuDisabled}
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex justify-center">
        <button
          id="header-title-button"
          disabled={isLockedPage}
          onClick={() => router.push("/family")}
          className="text-4xl font-medium tracking-tight text-dark-purple dark:text-white hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("title")}
        </button>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isProfileDisabled} asChild>
            <button
              id="header-icon-button"
              className=" rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <AppAvatar imageUrl={imageUrl} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("account")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/family")}>
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/donate")}>
              {t("donate")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
