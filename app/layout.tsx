import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import { TailwindIndicator } from "@/components/layout/tailwind-indicator";
import { ThemeProvider } from "@/components/layout/theme-provider"

import "./globals.css";

interface StickyLayoutProps {
  children: React.ReactNode;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }


// export default function StickyLayout({ children }: StickyLayoutProps) {
//   return (
//     <>
//       <html lang="en" suppressHydrationWarning>
//         <head />
//         <body>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             {children}
//           </ThemeProvider>
//           <div className="relative flex min-h-screen flex-col">
//           <SiteHeader sticky />
//           <main className="flex h-full flex-1 flex-col">{children}</main> 
//           </div>
//         </body>
//       </html>
//     </>
//   )
// }


export default async function StickyLayout({ children }: StickyLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
    <div className="relative flex min-h-screen flex-col">
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <SiteHeader sticky />
      <main className="flex h-full flex-1 flex-col">{children}</main>
          
          
          <TailwindIndicator />
          {/* <Analytics /> */}
          {/* <Toaster /> */}
        </ThemeProvider>
      
      {/* <SiteFooter /> */}
    </div>
    </body>
    </html>
  );
}

