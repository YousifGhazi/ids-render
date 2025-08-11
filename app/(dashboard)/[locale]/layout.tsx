import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../../globals.css";
import { Notifications } from "@mantine/notifications";
import {
  ColorSchemeScript,
  DirectionProvider,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Shell } from "@/components/shell";
import { NextIntlClientProvider } from "next-intl";
import { theme } from "../../../theme";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";


const CairoFont = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IDS - Identity System",
  description: "Identity and Access Management System",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${CairoFont.variable}`}
      dir={dir}
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <NextIntlClientProvider locale={locale}>
          <DirectionProvider initialDirection={dir}>
            <MantineProvider theme={theme}>
              <DatesProvider settings={{ locale, consistentWeeks: true }}>
                <ModalsProvider>
                  <Shell initialFullSize={true}>{children}</Shell>
                  <Notifications />
                </ModalsProvider>
              </DatesProvider>
            </MantineProvider>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
