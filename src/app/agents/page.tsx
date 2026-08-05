import { AppShell } from "@/components/shell";
import { Panel } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status";
import { requireRouteAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { listAgents } from "@/lib/services/agents";

export default async function AgentsPage() {
  const user = await requireUser();
  requireRouteAccess(user.role, "/agents");
  const agents = await listAgents(user.tenantId);

  return (
    <AppShell user={user}>
      <PageHeader eyebrow="SAICC Agent Operations" title="AI Agent Health" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <Panel key={agent.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{agent.name}</h2>
                <p className="text-sm text-stone-500">{agent.ownerTeam}</p>
              </div>
              <StatusBadge status={agent.status} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-stone-500">Success rate</dt><dd className="mt-1 text-xl font-semibold">{agent.successRate}%</dd></div>
              <div><dt className="text-stone-500">Latency</dt><dd className="mt-1 text-xl font-semibold">{agent.latencyMs}ms</dd></div>
              <div className="col-span-2"><dt className="text-stone-500">Last run</dt><dd className="mt-1">{agent.lastRunAt.toLocaleString()}</dd></div>
            </dl>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
