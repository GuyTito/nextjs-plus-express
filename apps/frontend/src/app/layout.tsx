import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monorepo App",
  description: "Next.js + Express monorepo",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
