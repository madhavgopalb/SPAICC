import "server-only";

import { ToolStatus, type User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/services/audit";

export async function listTools(tenantId: string) {
  return prisma.aiTool.findMany({ where: { tenantId }, orderBy: [{ status: "asc" }, { name: "asc" }] });
}

export async function updateToolStatus(user: User, toolId: string, status: ToolStatus) {
  const tool = await prisma.aiTool.update({
    where: { id: toolId, tenantId: user.tenantId },
    data: { status }
  });
  await audit(user, "updated_ai_tool_status", "AiTool", tool.id, { status });
  return tool;
}
