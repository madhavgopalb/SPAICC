import { convertAlertAction, resolveIncidentAction } from "@/app/actions";
import { AppShell } from "@/components/shell";
import { Panel } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { RiskBadge, StatusBadge } from "@/components/status";
import { requireRouteAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { listSecurityAlerts } from "@/lib/services/security";
import { prisma } from "@/lib/db";

export default async function SecurityPage() {
  const user = await requireUser();
  requireRouteAccess(user.role, "/security");
  const [alerts, incidents] = await Promise.all([
    listSecurityAlerts(user.tenantId),
    prisma.incident.findMany({ where: { tenantId: user.tenantId }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <AppShell user={user}>
      <PageHeader eyebrow="SAICC Security" title="Security Alerts and Incidents" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-semibold">Alerts</h2>
          <div className="mt-4 space-y-4">
            {alerts.map((alert) => (
              <div className="rounded border border-stone-200 p-4" key={alert.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{alert.description}</p>
                    <p className="mt-2 text-xs text-stone-500">{alert.source}</p>
                  </div>
                  <div className="flex gap-2"><RiskBadge risk={alert.riskLevel} /><StatusBadge status={alert.status} /></div>
                </div>
                {alert.status !== "CONVERTED" ? (
                  <form action={convertAlertAction} className="mt-4">
                    <input type="hidden" name="alertId" value={alert.id} />
                    <button className="focus-ring rounded bg-ink px-3 py-2 text-sm font-semibold text-white">Convert to incident</button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-lg font-semibold">Incidents</h2>
          <div className="mt-4 space-y-4">
            {incidents.length === 0 ? <p className="text-sm text-stone-500">No incidents yet. Convert an alert to create one.</p> : null}
            {incidents.map((incident) => (
              <div className="rounded border border-stone-200 p-4" key={incident.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{incident.title}</p>
                    <p className="mt-1 text-sm text-stone-600">Owner: {incident.owner}</p>
                  </div>
                  <StatusBadge status={incident.status} />
                </div>
                {incident.status !== "RESOLVED" ? (
                  <form action={resolveIncidentAction} className="mt-4">
                    <input type="hidden" name="incidentId" value={incident.id} />
                    <button className="focus-ring rounded border border-stone-300 px-3 py-2 text-sm font-semibold hover:bg-stone-50">Resolve incident</button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
