"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Coffee, Sparkles } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useAlert } from "@/components/logic/AlertProvider";

export default function DonatePage() {
  const t = useTranslations("Donate");
  const locale = useLocale();
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const Price_map: Record<
    string,
    { small: string; medium: string; large: string }
  > = {
    en: {
      small: "price_1SWMgNCiOh8HBIoj56afduI0",
      medium: "price_1SWMimCiOh8HBIojsBmORvBa",
      large: "price_1SWMjLCiOh8HBIojn0YjHhxN",
    },
    cz: {
      small: "price_1SWMgNCiOh8HBIojKX1iHxv4",
      medium: "price_1SWMimCiOh8HBIojDd4A9vgu",
      large: "price_1SWMjLCiOh8HBIojuvqHQOt4",
    },
  };

  const prices = Price_map[locale] ?? Price_map["en"];

  async function handleDonate(priceId: string) {
    try {
      setLoadingPrice(priceId);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      showAlert(`Checkout failed: ${err}`);
    } finally {
      setLoadingPrice(null);
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br">
      <Card className="w-full max-w-4xl rounded-3xl shadow-2xl border-2 overflow-hidden border-primary/50 bg-white dark:bg-black ">
        <CardContent className="p-8 sm:p-12">
          <div className="text-center space-y-6 mb-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary blur-3xl rounded-full" />
              <Heart
                className="w-16 h-16 sm:w-20 sm:h-20 text-secondary mx-auto relative animate-pulse"
                fill="currentColor"
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <div className="space-y-5 text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            <p className="text-center">{t("p1")}</p>
            <p className="text-center">{t("p2")}</p>
            <p className="text-center">{t("p3")}</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t("buyUs")}:
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <Button
              onClick={() => handleDonate(prices.small)}
              disabled={!!loadingPrice}
              className="group relative overflow-hidden hover:bg-secondary/50 border-2 border-primary rounded-2xl p-6 h-auto transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-primary-50 to-secondary-50 "
            >
              <div className="flex flex-col items-center gap-3">
                <Coffee className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {t("small")}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {t("priceSmall")}
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleDonate(prices.medium)}
              disabled={!!loadingPrice}
              className="group relative overflow-hidden hover:bg-secondary/50 border-2 border-primary rounded-2xl p-6 h-auto transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-primary-50 to-secondary-50 "
            >
              <div className="absolute top-2 right-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full">
                Popular
              </div>
              <div className="flex flex-col items-center gap-3">
                <Heart className="w-10 h-10 text-primary" fill="currentColor" />
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {t("medium")}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {t("priceMedium")}
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleDonate(prices.large)}
              disabled={!!loadingPrice}
              className="group relative overflow-hidden hover:bg-secondary/50 border-2 border-primary rounded-2xl p-6 h-auto transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-primary-50 to-secondary-50 "
            >
              <div className="flex flex-col items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {t("large")}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {t("priceLarge")}
                  </div>
                </div>
              </div>
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 max-w-xl mx-auto">
            {t("footer")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
