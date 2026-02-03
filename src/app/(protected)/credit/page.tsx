"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion } from "framer-motion";

export default function CreditPage() {
  const t = useTranslations("Settings");
  const [copiedGmail, setCopiedGmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyGmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGmail(true);
    setTimeout(() => setCopiedGmail(false), 1500);
  };

  const handleCopyPhone = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-5xl rounded-2xl shadow-lg p-6 border dark:border-gray-700 border-gray-200">
        <CardContent className="space-y-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200">
              <Image
                src="/oblicej.jpg"
                alt="Profile Photo"
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold">Kryštof Marcol</h1>
              <p className="text-sm leading-relaxed dark:text-gray-300  text-gray-700">
                {t("Credit.infoAboutMe")}
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>{t("Credit.contact")}: </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 dark:hover:text-white"
                      onClick={() => handleCopyPhone("@KikiNbroskev")}
                    >
                      <Copy className="h-4 w-4" />
                      {copiedPhone ? t("Credit.copied") : "@KikiNbroskev"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div>{t("Credit.gmail")}: </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 dark:hover:text-white"
                      onClick={() => handleCopyGmail("marcol.prace@gmail.com")}
                    >
                      <Copy className="h-4 w-4" />
                      {copiedGmail
                        ? t("Credit.copied")
                        : "marcol.prace@gmail.com"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-bold text-xl mb-4">
                {t("Credit.supportTitle")}
              </h2>

              <div className="space-y-4 text-sm dark:text-gray-300 text-gray-700">
                <p>{t("Credit.supportText1")}</p>
                <p>{t("Credit.supportText2")}</p>
                <p>{t("Credit.supportText3")}</p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-xl mb-4">{t("Credit.features")}</h2>

              <ul className="list-disc ml-5 text-sm space-y-2a dark:text-gray-300 text-gray-700">
                <li>{t("Credit.featureCalendar")}</li>
                <li>{t("Credit.featureDuties")}</li>
                <li>{t("Credit.featureShopping")}</li>
                <li>{t("Credit.featureExpenses")}</li>
                <li>{t("Credit.featureSync")}</li>
                <li>{t("Credit.featureNotifications")}</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-bold text-xl mb-4">{t("Credit.aboutApp")}</h2>

              <div className="space-y-4 text-sm dark:text-gray-300 text-gray-700">
                <p>{t("Credit.appDescription1")}</p>
                <p>{t("Credit.appDescription2")}</p>
                <p>{t("Credit.appDescription3")}</p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-xl mb-4">
                {t("Credit.supportWays")}
              </h2>

              <ul className="list-disc ml-5 text-sm space-y-2 dark:text-gray-300 text-gray-700">
                <li>{t("Credit.supportFeedback")}</li>
                <li>{t("Credit.supportShare")}</li>
                <li>{t("Credit.supportDonate")}</li>
                <li>{t("Credit.supportIdeas")}</li>
              </ul>
              <motion.div
                className="pt-4"
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                  mass: 1,
                }}
              >
                <a
                  href="/donate"
                  className="inline-block px-4 py-2 text-sm font-medium hover:text-white rounded-lg border border-gray-300 dark:border-gray-600 dark:text-gray-200 text-gray-700 hover:bg-secondary dark:hover:bg-gray-900 transition"
                >
                  {t("Credit.donateButton")}
                </a>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
