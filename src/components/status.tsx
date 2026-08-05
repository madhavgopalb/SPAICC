import { Badge } from "@/components/badge";

export function RiskBadge({ risk }: { risk: string }) {
  const tone = risk === "CRITICAL" || risk === "HIGH" ? "bad" : risk === "MEDIUM" ? "warn" : "good";
  return <Badge tone={tone}>{risk}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status.includes("APPROVED") || status.includes("HEALTHY") || status.includes("RESOLVED") ? "good" : status.includes("BLOCKED") || status.includes("DOWN") ? "bad" : "warn";
  return <Badge tone={tone}>{status.replaceAll("_", " ")}</Badge>;
}
