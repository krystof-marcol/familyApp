import type { Metadata, Viewport } from "next";
import "./globals.css";
import ApolloWrapper from "@/lib/apollo-wrapper";
import { Poppins } from "next/font/google";
import NextAuthSessionProvider from "@/components/logic/session-provider";
import { getUserSession, authOptions } from "@/lib/auth";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getServerSession } from "next-auth";
import { AlertProvider } from "@/components/logic/AlertProvider";
import { AlertContainer } from "@/components/logic/AlertContainer";
import ClientAppShell from "@/components/ClientAppShell";
import Providers from "@/components/logic/providers";
import RegisterPWA from "@/components/logic/RegisterPWA";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Family App",
    template: "Family App | %s",
  },
  description: "Manage your family life",
  manifest: "/manifest.json",
  icons: {
    icon: "/family-icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Family App",
    startupImage: "/family-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserSession();
  const session = await getServerSession(authOptions);

  const locale = session?.user.language || "en";
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={poppins.variable} suppressHydrationWarning>
      <body className={poppins.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ApolloWrapper>
              <NextAuthSessionProvider>
                <RegisterPWA />
                <ClientAppShell user={user}>
                  <AlertProvider>
                    <AlertContainer />
                    {children}
                  </AlertProvider>
                </ClientAppShell>
              </NextAuthSessionProvider>
            </ApolloWrapper>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
