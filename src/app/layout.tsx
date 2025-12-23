import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/shared/ui/sonner";
import { NextAuthProvider } from "@/lib/providers/next-auth-providers";
import ReactQueryProvider from "@/lib/providers/react-query-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { StoreScopeProvider } from "@/lib/providers/store-scope-provider";
import { Suspense } from "react";
import Loading from "@/shared/ui/loading";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Shop Admin",
  description: "Admin panel for Shop application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} antialiased`}>
        <Suspense fallback={<Loading />}>
          <NextAuthProvider>
            <StoreScopeProvider>
              <ReactQueryProvider>
                <ThemeProvider>
                  {children}
                  <Toaster />
                </ThemeProvider>
              </ReactQueryProvider>
            </StoreScopeProvider>
          </NextAuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
