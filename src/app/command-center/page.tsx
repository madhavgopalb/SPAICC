import { RadioTower } from "lucide-react";
import { generateSyntheticEventAction } from "@/app/actions";
import { AppShell } from "@/components/shell";
import { Panel } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { RiskBadge } from "@/components/status";
import { requireRouteAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/services/dashboard";
import { money } from "@/lib/utils";

export default async function CommandCenterPage() {
  const user = await requireUser();
  requireRouteAccess(user.role, "/command-center");
  const data = await getDashboardData(user.tenantId);

  return (
    <AppShell user={user}>
      <PageHeader eyebrow="SAICC Live Operations" title="Live Command Center">
        <form action={generateSyntheticEventAction}>
          <button className="focus-ring inline-flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
            <RadioTower size={16} aria-hidden />
            Generate synthetic event
          </button>
        </form>
      </PageHeader>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr>
                <th className="py-3">Time</th>
                <th>Department</th>
                <th>Provider</th>
                <th>Category</th>
                <th>Risk</th>
                <th>Cost</th>
                <th>Privacy</th>
              </tr>
            </thead>
            <tbody>
              {data.events.slice(0, 25).map((event) => (
                <tr className="border-b border-stone-100" key={event.id}>
                  <td className="py-3">{event.occurredAt.toLocaleTimeString()}</td>
                  <td>{event.department}</td>
                  <td>{event.provider}</td>
                  <td>{event.promptCategory.replaceAll("_", " ")}</td>
                  <td><RiskBadge risk={event.riskLevel} /></td>
                  <td>{money(event.estimatedCost)}</td>
                  <td>{event.containsSensitive ? "Sensitive metadata only" : "No sensitive signal"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
