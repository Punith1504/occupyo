import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import TelemetryTracker from "@/components/TelemetryTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Occupyo - Global Flex Occupancy Marketplace",
  description: "List and discover commercial real estate worldwide. Premium B2B flex occupancy marketplace.",
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
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
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
        className="h-full antialiased"
      >
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
          <TelemetryTracker />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
