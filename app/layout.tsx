import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReminderChecker } from "@/components/ReminderChecker";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Salein",
  description: "Salein is a modern invoice management system with features for creating, uploading, and managing invoices with automated reminders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <body>
        <AuthProvider>
          <InvoiceProvider>
            <Toaster richColors position="top-right" />
            <ReminderChecker />
            {children}
          </InvoiceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
