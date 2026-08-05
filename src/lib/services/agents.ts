import "server-only";

import { prisma } from "@/lib/db";

export async function listAgents(tenantId: string) {
  return prisma.aiAgent.findMany({ where: { tenantId }, orderBy: [{ status: "desc" }, { lastRunAt: "desc" }] });
}
