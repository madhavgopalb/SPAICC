import { AppShell } from "@/components/shell";
import { Panel } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { requireRouteAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { listCosts } from "@/lib/services/costs";
import { money } from "@/lib/utils";

export default async function CostsPage() {
  const user = await requireUser();
  requireRouteAccess(user.role, "/costs");
  const costs = await listCosts(user.tenantId);
  const total = costs.reduce((sum, cost) => sum + cost.spend, 0);
  const inactive = costs.reduce((sum, cost) => sum + cost.inactive, 0);

  return (
    <AppShell user={user}>
      <PageHeader eyebrow="SAICC Finance" title="Cost Overview" />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel><p className="text-sm text-stone-500">Total provider spend</p><p className="mt-2 text-3xl font-semibold">{money(total)}</p></Panel>
        <Panel><p className="text-sm text-stone-500">Inactive paid licenses</p><p className="mt-2 text-3xl font-semibold">{inactive}</p></Panel>
      </div>
      <Panel className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr><th className="py-3">Provider</th><th>Department</th><th>Month</th><th>Spend</th><th>Licenses</th><th>Inactive</th></tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <tr className="border-b border-stone-100" key={cost.id}>
                  <td className="py-3">{cost.provider}</td>
                  <td>{cost.department}</td>
                  <td>{cost.month}</td>
                  <td>{money(cost.spend)}</td>
                  <td>{cost.licenses}</td>
                  <td>{cost.inactive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
