import "server-only";

import { prisma } from "@/lib/db";

export async function listAuditLogs(tenantId: string) {
  return prisma.auditLog.findMany({
    where: { tenantId },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
