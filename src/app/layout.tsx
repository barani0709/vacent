import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel Dashboard",
  description: "Excel-driven interactive dashboard with Neon"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}


