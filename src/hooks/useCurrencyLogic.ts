import { useState, useEffect } from "react";

type Rates = {
  USD: number;
  CZK: number;
  EUR: number;
};

export function useCurrencyLogic() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(
          "https://api.frankfurter.app/latest?from=EUR&to=USD,CZK",
        );
        const data = await res.json();
        setRates(data.rates);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch rates", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const convertFromEuro = (euroAmount: number, to: "USD" | "CZK" | "EUR") => {
    if (!rates) return 0;
    if (to === "EUR") return euroAmount;

    const rate = rates[to as "USD" | "CZK"];
    return euroAmount * rate;
  };

  const convertToEuro = (amount: number, currency: "USD" | "CZK" | "EUR") => {
    if (!rates) return 0;
    if (currency === "EUR") return amount;
    const rate = rates[currency];

    return amount / rate;
  };

  return {
    loading,
    rates,
    convertFromEuro,
    convertToEuro,
  };
}
