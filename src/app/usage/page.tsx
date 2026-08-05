import { RiskLevel } from "@prisma/client";
import { AppShell } from "@/components/shell";
import { Panel } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { RiskBadge } from "@/components/status";
import { requireRouteAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { listUsageEvents } from "@/lib/services/events";
import { money } from "@/lib/utils";

type UsageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UsagePage({ searchParams }: { searchParams: UsageSearchParams }) {
  const user = await requireUser();
  requireRouteAccess(user.role, "/usage");
  const params = await searchParams;
  const risk = one(params.riskLevel);
  const events = await listUsageEvents(user.tenantId, {
    department: one(params.department),
    provider: one(params.provider),
    riskLevel: risk && Object.values(RiskLevel).includes(risk as RiskLevel) ? (risk as RiskLevel) : undefined
  });

  return (
    <AppShell user={user}>
      <PageHeader eyebrow="SAICC Usage Monitoring" title="AI Usage Events" />
      <Panel>
        <form className="grid gap-3 md:grid-cols-4">
          <input className="focus-ring rounded border border-stone-300 px-3 py-2" name="department" placeholder="Department" defaultValue={one(params.department) ?? ""} />
          <input className="focus-ring rounded border border-stone-300 px-3 py-2" name="provider" placeholder="Provider" defaultValue={one(params.provider) ?? ""} />
          <select className="focus-ring rounded border border-stone-300 px-3 py-2" name="riskLevel" defaultValue={risk ?? ""}>
            <option value="">All risk levels</option>
            {Object.values(RiskLevel).map((level) => <option value={level} key={level}>{level}</option>)}
          </select>
          <button className="focus-ring rounded bg-ink px-4 py-2 text-sm font-semibold text-white">Apply filters</button>
        </form>
      </Panel>
      <Panel className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr><th className="py-3">User</th><th>Department</th><th>Tool</th><th>Provider</th><th>Risk</th><th>Tokens</th><th>Cost</th><th>Occurred</th></tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr className="border-b border-stone-100" key={event.id}>
                  <td className="py-3">{event.userEmail}</td>
                  <td>{event.department}</td>
                  <td>{event.tool?.name ?? "Unregistered tool"}</td>
                  <td>{event.provider}</td>
                  <td><RiskBadge risk={event.riskLevel} /></td>
                  <td>{event.tokens.toLocaleString()}</td>
                  <td>{money(event.estimatedCost)}</td>
                  <td>{event.occurredAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
