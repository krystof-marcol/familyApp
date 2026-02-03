"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import FamilyLoader from "@/components/Loading";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <FamilyLoader />;
  }

  return <>{children}</>;
}
