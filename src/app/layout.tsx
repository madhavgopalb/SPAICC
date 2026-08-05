import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SprintPark AI Command Center | SAICC",
  description: "SAICC provides centralized enterprise AI visibility, governance, security monitoring, and cost management."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
