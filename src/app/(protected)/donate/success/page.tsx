"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function DonateSuccessPage() {
  const t = useTranslations("Donate");
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-4">{t("successThanks")}</h1>
        <p className="mb-6">{t("successMessage")}</p>
        <Link href="/" className="text-blue-600 underline">
          {t("successBack")}
        </Link>
      </div>
    </div>
  );
}
