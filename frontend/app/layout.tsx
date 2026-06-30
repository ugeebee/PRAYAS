import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRAYAS Portal",
  description: "NHPC Employee Volunteering Scheme",
};

import TokenExpiry from "@/components/TokenExpiry";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <TokenExpiry />
        {children}
      </body>
    </html>
  );
}