import type { Role } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  roles: Role[];
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Executive Dashboard", roles: ["EXECUTIVE", "PLATFORM_ADMIN", "DEPARTMENT_HEAD"] },
  { href: "/command-center", label: "Live Command Center", roles: ["EXECUTIVE", "SECURITY", "PLATFORM_ADMIN"] },
  { href: "/usage", label: "AI Usage Events", roles: ["EXECUTIVE", "SECURITY", "PLATFORM_ADMIN", "DEPARTMENT_HEAD"] },
  { href: "/security", label: "Security Alerts", roles: ["SECURITY", "PLATFORM_ADMIN"] },
  { href: "/tools", label: "AI Tools Registry", roles: ["PLATFORM_ADMIN", "SECURITY"] },
  { href: "/agents", label: "AI Agent Health", roles: ["PLATFORM_ADMIN", "SECURITY"] },
  { href: "/costs", label: "Cost Overview", roles: ["EXECUTIVE", "FINANCE", "PLATFORM_ADMIN"] },
  { href: "/audit", label: "Audit Logs", roles: ["SECURITY", "PLATFORM_ADMIN"] }
];

export function canAccess(role: Role, href: string) {
  return navItems.some((item) => item.href === href && item.roles.includes(role));
}

export function allowedNav(role: Role) {
  return navItems.filter((item) => item.roles.includes(role));
}
