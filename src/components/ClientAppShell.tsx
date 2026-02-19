"use client";

import { useSession } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/logic/ThemeProvider";
import { ThemeSyncer } from "@/components/logic/theme-syncer";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface ClientAppShellProps {
  children: React.ReactNode;
  user: {
    name?: string;
    imageUrl?: string;
    isAuthenticated?: boolean;
    family?: {
      name: string;
      id: string;
    } | null;
  };
}

export default function ClientAppShell({
  children,
  user,
}: ClientAppShellProps) {
  const pathname = usePathname();

  const isAuthPage = pathname === "/auth" || pathname?.startsWith("/auth/");

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);
    const handleResize = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const { data: session } = useSession();

  const familyName = user.family?.name ?? "";
  const userImage = user.imageUrl || session?.user?.imageUrl || "";
  const isAuthenticated = user.isAuthenticated || !!session?.user;
  const userName = user.name || session?.user?.name || "";
  const familyId = user.family?.id ?? "";

  return (
    <SidebarProvider>
      {!isMobile && !isAuthPage && (
        <AppSidebar
          familyName={familyName}
          familyId={familyId}
          imageUrl={userImage}
          userName={userName}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {!isAuthPage && (
          <Header
            disabled={!isAuthenticated || !user.family}
            imageUrl={userImage}
          />
        )}

        <main
          className={`flex-1 overflow-auto p-4 ${isAuthPage ? "pb-4" : "pb-20 md:pb-4"}`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ThemeSyncer />
            {children}
          </ThemeProvider>
        </main>
      </div>

      {isMobile && !isAuthPage && <MobileNav familyId={familyId} />}
    </SidebarProvider>
  );
}
