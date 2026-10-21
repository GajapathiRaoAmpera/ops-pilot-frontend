import type { Metadata, Viewport } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { PalettePreview } from "@/components/dev/PalettePreview";
import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import "@/styles/globals.scss";

// Fira Sans for labels and prose, Fira Code for identifiers and figures (data-dense console pairing).
const sans = Fira_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const mono = Fira_Code({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "OpsPilot",
  description: "AI-powered enterprise DevOps automation platform",
};

export const viewport: Viewport = { themeColor: "#0f172a", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body><ToastProvider>{children}</ToastProvider><PalettePreview /></body>
    </html>
  );
}
