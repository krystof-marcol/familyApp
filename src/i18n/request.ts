import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale =
    cookieStore.get("NEXT_LOCALE")?.value ||
    headerStore.get("x-next-intl-locale") ||
    "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
