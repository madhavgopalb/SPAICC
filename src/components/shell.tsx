import { Bot, Building2, LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { allowedNav } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export function AppShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: Role; tenant: { name: string } };
}) {
  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-stone-200 bg-white px-4 py-5 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-brand text-white">
            <Bot size={22} aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold leading-5">SprintPark AI Command Center</p>
            <p className="text-xs text-stone-500">SPAICC</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {allowedNav(user.role).map((item) => (
            <Link className="block rounded px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Building2 className="text-brand" size={20} aria-hidden />
              <div>
                <p className="text-sm font-semibold">{user.tenant.name}</p>
                <p className="text-xs text-stone-500">{user.name} | {user.role.replaceAll("_", " ")}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <button className="focus-ring inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-50">
                <LogOut size={16} aria-hidden />
                Sign out
              </button>
            </form>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {allowedNav(user.role).map((item) => (
              <Link className="whitespace-nowrap rounded border border-stone-200 bg-white px-3 py-1.5 text-sm" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
