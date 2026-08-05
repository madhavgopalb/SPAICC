import { ToolStatus } from "@prisma/client";
import { updateToolStatusAction } from "@/app/actions";
import { AppShell } from "@/components/shell";
import { Panel } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status";
import { requireRouteAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { listTools } from "@/lib/services/tools";
import { money } from "@/lib/utils";

export default async function ToolsPage() {
  const user = await requireUser();
  requireRouteAccess(user.role, "/tools");
  const tools = await listTools(user.tenantId);

  return (
    <AppShell user={user}>
      <PageHeader eyebrow="SAICC Governance" title="AI Tools Registry" />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr><th className="py-3">Tool</th><th>Provider</th><th>Category</th><th>Owner</th><th>Status</th><th>Monthly cost</th><th>Governance action</th></tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr className="border-b border-stone-100 align-top" key={tool.id}>
                  <td className="py-3"><p className="font-medium">{tool.name}</p><p className="text-xs text-stone-500">{tool.riskNotes}</p></td>
                  <td>{tool.provider}</td>
                  <td>{tool.category}</td>
                  <td>{tool.ownerTeam}</td>
                  <td><StatusBadge status={tool.status} /></td>
                  <td>{money(tool.monthlyCost)}</td>
                  <td>
                    <form action={updateToolStatusAction} className="flex gap-2">
                      <input type="hidden" name="toolId" value={tool.id} />
                      <select className="focus-ring rounded border border-stone-300 px-2 py-1" name="status" defaultValue={tool.status}>
                        {Object.values(ToolStatus).map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}
                      </select>
                      <button className="focus-ring rounded bg-ink px-3 py-1.5 text-xs font-semibold text-white">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
