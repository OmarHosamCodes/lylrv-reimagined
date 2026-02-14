import { cn } from "@lylrv/ui";
import { ThemeProvider, ThemeToggle } from "@lylrv/ui/theme";
import { Toaster } from "@lylrv/ui/toast";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: {
    default: "Lylrv — Loyalty & Reviews Platform",
    template: "%s | Lylrv",
  },
  description:
    "The all-in-one platform for loyalty programs, customer reviews, and embeddable widgets that drive retention and trust.",
  openGraph: {
    title: "Lylrv — Loyalty & Reviews Platform",
    description:
      "Drive customer retention and trust with loyalty programs, reviews, and embeddable widgets.",
    url: "https://lylrv.com",
    siteName: "Lylrv",
  },
  twitter: {
    card: "summary_large_image",
    site: "@lylrv",
    creator: "@lylrv",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1612" },
  ],
};

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          bricolage.variable,
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider>
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
          <div className="fixed right-4 bottom-4 z-50">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
