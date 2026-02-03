"use client";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);
  const t = useTranslations("Error");
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center ">
      <div className="relative mb-8">
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary blur-3xl"></div>
        <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-[#8B5CF6]/20 backdrop-blur-sm shadow-lg shadow-[#8B5CF6]/40">
          <Heart className="w-14 h-14 text-primary" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
        {t("title")}
      </h1>
      <p className="text-primary max-w-md text-sm sm:text-base leading-relaxed mb-10">
        {t("chillTitle")}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-secondary transition shadow-md shadow-[#A78BFA]/40"
        >
          {t("tryAgain")}
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-secondary transition shadow-md shadow-[#A78BFA]/40"
        >
          {t("goHome")}
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && (
        <p className="text-xs text-primary mt-6">{error?.message}</p>
      )}
    </div>
  );
}
