import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SiteHeader } from "@/components/layout/site-header";
import { Analytics } from "@vercel/analytics/react"

import { TailwindIndicator } from "@/components/layout/tailwind-indicator";
import { ThemeProvider } from "@/components/layout/theme-provider"

import "./globals.css";

interface StickyLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Linked Chart & Table Component",
  description: "A React component that synchronizes chart and table views, built with Next.js, shadcn/ui, and Recharts.",
};


export default async function StickyLayout({ children }: StickyLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>
    <div className="relative flex min-h-screen flex-col">
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <SiteHeader sticky />
      <main className="flex h-full flex-1 flex-col">{children}</main>
          
        <TailwindIndicator />
        </ThemeProvider>
        <Analytics/>
      {/* <SiteFooter /> */}
    </div>
    </body>
    </html>
  );
}

