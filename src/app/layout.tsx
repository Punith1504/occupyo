import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import TelemetryTracker from "@/components/TelemetryTracker";
import ChatBot from "@/components/ChatBot";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Occupyo - Minnesota Flex Occupancy Marketplace",
  description: "List and discover commercial real estate in Minnesota. Premium B2B flex occupancy marketplace.",
  metadataBase: new URL("https://occupyo.com"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Occupyo",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f2f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`h-full antialiased ${inter.variable}`}
      >
        <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-[var(--font-inter)]">
          <TelemetryTracker />
          {children}
          <ChatBot />
        </body>
      </html>
    </ClerkProvider>
  );
}
