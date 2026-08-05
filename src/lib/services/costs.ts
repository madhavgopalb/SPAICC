import "server-only";

import { prisma } from "@/lib/db";

export async function listCosts(tenantId: string) {
  return prisma.costRecord.findMany({ where: { tenantId }, orderBy: [{ month: "desc" }, { spend: "desc" }] });
}
