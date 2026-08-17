import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPAICC | SprintPark AI Command Center",
  description: "SPAICC provides centralized enterprise AI visibility, governance, security monitoring, and cost management."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
