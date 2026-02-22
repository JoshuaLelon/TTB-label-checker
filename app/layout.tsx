/**
 * @design-guard
 * role: Root layout providing HTML structure, fonts, header, and error boundary
 * layer: ui
 * non_goals:
 *   - Page-specific layouts or nested layouts
 *   - Authentication or session management
 * boundaries:
 *   depends_on: [next/font, components/app-header, components/error-boundary]
 *   exposes: [RootLayout, metadata]
 * invariants:
 *   - All pages render within ErrorBoundary wrapper
 *   - Geist font variables are always available via CSS custom properties
 * authority:
 *   decides: [HTML structure, global font, error boundary placement]
 *   delegates: [Header rendering to AppHeader, error handling to ErrorBoundary]
 * extension_policy: Add providers (theme, auth) as wrappers inside body
 * failure_contract: Server component — Next.js handles rendering errors
 * testing_contract: Verify children render within error boundary and header is present
 * references: [Next.js layout convention]
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TTB Label Checker",
  description:
    "AI-powered label verification for the Alcohol and Tobacco Tax and Trade Bureau",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AppHeader />
          <main className="container mx-auto max-w-6xl px-4 py-8">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
