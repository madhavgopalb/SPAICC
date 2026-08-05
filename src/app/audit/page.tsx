import { AppShell } from "@/components/shell";
import { Panel } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { requireRouteAccess } from "@/lib/access";
import { requireUser } from "@/lib/auth";
import { listAuditLogs } from "@/lib/services/audit-list";

export default async function AuditPage() {
  const user = await requireUser();
  requireRouteAccess(user.role, "/audit");
  const logs = await listAuditLogs(user.tenantId);

  return (
    <AppShell user={user}>
      <PageHeader eyebrow="SAICC Accountability" title="Audit Logs" />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr><th className="py-3">Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Metadata</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr className="border-b border-stone-100 align-top" key={log.id}>
                  <td className="py-3">{log.createdAt.toLocaleString()}</td>
                  <td>{log.actor?.email ?? "System"}</td>
                  <td>{log.action}</td>
                  <td>{log.entity}</td>
                  <td><code className="text-xs text-stone-600">{JSON.stringify(log.metadata)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
