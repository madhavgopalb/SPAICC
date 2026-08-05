import "server-only";

import { RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/db";

export type EventFilters = {
  department?: string;
  riskLevel?: RiskLevel;
  provider?: string;
};

export async function listUsageEvents(tenantId: string, filters: EventFilters) {
  return prisma.aiUsageEvent.findMany({
    where: {
      tenantId,
      department: filters.department || undefined,
      riskLevel: filters.riskLevel || undefined,
      provider: filters.provider || undefined
    },
    include: { tool: true },
    orderBy: { occurredAt: "desc" },
    take: 100
  });
}

export async function createSyntheticEvent(tenantId: string) {
  const tools = await prisma.aiTool.findMany({ where: { tenantId } });
  const tool = tools[Math.floor(Math.random() * tools.length)];
  const risks: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const departments = ["Engineering", "Finance", "Legal", "Marketing", "Sales"];
  const riskLevel = risks[Math.floor(Math.random() * risks.length)];

  return prisma.aiUsageEvent.create({
    data: {
      tenantId,
      toolId: tool?.id,
      userEmail: `${departments[Math.floor(Math.random() * departments.length)].toLowerCase()}.user@sprintpark.example`,
      department: departments[Math.floor(Math.random() * departments.length)],
      provider: tool?.provider ?? "Unknown Provider",
      eventType: Math.random() > 0.45 ? "prompt_completion" : "file_analysis",
      promptCategory: Math.random() > 0.6 ? "customer_data" : "productivity",
      riskLevel,
      tokens: Math.floor(1200 + Math.random() * 8000),
      estimatedCost: Number((0.4 + Math.random() * 11).toFixed(2)),
      containsSensitive: riskLevel === "HIGH" || riskLevel === "CRITICAL",
      occurredAt: new Date()
    }
  });
}
