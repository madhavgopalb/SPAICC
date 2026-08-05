import "server-only";

import { RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function getDashboardData(tenantId: string) {
  const [events, alerts, tools, agents, costs] = await Promise.all([
    prisma.aiUsageEvent.findMany({ where: { tenantId }, orderBy: { occurredAt: "desc" }, take: 200 }),
    prisma.securityAlert.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.aiTool.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.aiAgent.findMany({ where: { tenantId }, orderBy: { lastRunAt: "desc" } }),
    prisma.costRecord.findMany({ where: { tenantId }, orderBy: { month: "desc" } })
  ]);

  const totalSpend = costs.reduce((sum, item) => sum + item.spend, 0);
  const highRisk = events.filter((event) => event.riskLevel === RiskLevel.HIGH || event.riskLevel === RiskLevel.CRITICAL).length;
  const sensitive = events.filter((event) => event.containsSensitive).length;
  const governanceScore = Math.max(62, 100 - highRisk * 2 - alerts.filter((alert) => alert.status === "OPEN").length * 3);

  return {
    kpis: {
      events: events.length,
      activeTools: tools.filter((tool) => tool.status === "APPROVED").length,
      openAlerts: alerts.filter((alert) => alert.status === "OPEN").length,
      totalSpend,
      governanceScore
    },
    events,
    alerts,
    tools,
    agents,
    costs,
    riskSummary: [
      { name: "Low", value: events.filter((event) => event.riskLevel === "LOW").length },
      { name: "Medium", value: events.filter((event) => event.riskLevel === "MEDIUM").length },
      { name: "High", value: events.filter((event) => event.riskLevel === "HIGH").length },
      { name: "Critical", value: events.filter((event) => event.riskLevel === "CRITICAL").length }
    ],
    departmentSpend: Object.values(
      costs.reduce<Record<string, { department: string; spend: number }>>((acc, cost) => {
        acc[cost.department] ??= { department: cost.department, spend: 0 };
        acc[cost.department].spend += cost.spend;
        return acc;
      }, {})
    ),
    sensitive
  };
}
