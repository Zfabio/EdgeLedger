import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "EdgeLedger",
  description: "Your private financial portfolio terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {children}
      </body>
    </html>
  );
}
