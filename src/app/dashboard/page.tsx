import { AppShell } from "@/components/shell";
import { KpiCard, Panel } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { RiskBadge, StatusBadge } from "@/components/status";
import { RiskChart, SpendChart } from "@/components/charts";
import { requireRouteAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/services/dashboard";
import { compact, money } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  requireRouteAccess(user.role, "/dashboard");
  const data = await getDashboardData(user.tenantId);

  return (
    <AppShell user={user}>
      <PageHeader eyebrow="SAICC Overview" title="Executive AI Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="AI usage events" value={compact(data.kpis.events)} detail="Privacy-safe metadata events" />
        <KpiCard label="Approved tools" value={String(data.kpis.activeTools)} detail="Available for enterprise use" />
        <KpiCard label="Open alerts" value={String(data.kpis.openAlerts)} detail="Require review or triage" />
        <KpiCard label="Monthly spend" value={money(data.kpis.totalSpend)} detail="Provider and department cost" />
        <KpiCard label="Governance score" value={`${data.kpis.governanceScore}%`} detail="Weighted risk posture" />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-semibold">Risk distribution</h2>
          <RiskChart data={data.riskSummary} />
        </Panel>
        <Panel>
          <h2 className="text-lg font-semibold">Department spend</h2>
          <SpendChart data={data.departmentSpend} />
        </Panel>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel>
          <h2 className="text-lg font-semibold">Recent security alerts</h2>
          <div className="mt-4 space-y-3">
            {data.alerts.slice(0, 4).map((alert) => (
              <div className="flex items-start justify-between gap-3 border-t border-stone-100 pt-3" key={alert.id}>
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-stone-500">{alert.source}</p>
                </div>
                <RiskBadge risk={alert.riskLevel} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-lg font-semibold">Agent health</h2>
          <div className="mt-4 space-y-3">
            {data.agents.map((agent) => (
              <div className="flex items-center justify-between border-t border-stone-100 pt-3" key={agent.id}>
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-stone-500">{agent.ownerTeam} | {agent.successRate}% success</p>
                </div>
                <StatusBadge status={agent.status} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
