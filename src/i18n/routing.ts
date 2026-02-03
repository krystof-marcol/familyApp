import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "cz"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
