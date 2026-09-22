import type { Metadata } from "next";

import "./globals.css";

import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "AllianceOS",
  description:
    "AI-native Partner & Co-Sell Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}