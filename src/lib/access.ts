import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { allowedNav, canAccess } from "@/lib/permissions";

export function requireRouteAccess(role: Role, href: string) {
  if (canAccess(role, href)) {
    return;
  }

  redirect(allowedNav(role)[0]?.href ?? "/login");
}
