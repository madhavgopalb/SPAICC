import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function audit(user: Pick<User, "id" | "tenantId">, action: string, entity: string, entityId: string, metadata: Prisma.InputJsonValue = {}) {
  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId,
      actorId: user.id,
      action,
      entity,
      entityId,
      metadata
    }
  });
}
