import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vacancy Management System",
  description: "Employee and vacancy tracking dashboard"
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


