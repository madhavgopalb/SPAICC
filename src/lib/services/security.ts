import "server-only";

import { prisma } from "@/lib/db";
import { audit } from "@/lib/services/audit";
import type { User } from "@prisma/client";

export async function listSecurityAlerts(tenantId: string) {
  return prisma.securityAlert.findMany({
    where: { tenantId },
    include: { incident: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function convertAlertToIncident(user: User, alertId: string) {
  const alert = await prisma.securityAlert.findFirstOrThrow({
    where: { id: alertId, tenantId: user.tenantId }
  });

  const incident = await prisma.incident.create({
    data: {
      tenantId: user.tenantId,
      alertId: alert.id,
      title: alert.title,
      owner: "Security Operations",
      status: "ASSIGNED"
    }
  });

  await prisma.securityAlert.update({
    where: { id: alert.id },
    data: { status: "CONVERTED" }
  });

  await audit(user, "converted_alert_to_incident", "SecurityAlert", alert.id, { incidentId: incident.id });
  return incident;
}

export async function resolveIncident(user: User, incidentId: string) {
  const incident = await prisma.incident.update({
    where: { id: incidentId, tenantId: user.tenantId },
    data: { status: "RESOLVED", resolvedAt: new Date() }
  });
  await audit(user, "resolved_incident", "Incident", incident.id);
  return incident;
}
