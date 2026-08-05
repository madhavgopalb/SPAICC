import { describe, expect, it } from "vitest";
import { allowedNav, canAccess } from "./permissions";

describe("SAICC role-based navigation", () => {
  it("allows security users to operate alerts but not finance dashboards", () => {
    expect(canAccess("SECURITY", "/security")).toBe(true);
    expect(canAccess("SECURITY", "/costs")).toBe(false);
  });

  it("keeps finance users focused on cost overview", () => {
    const labels = allowedNav("FINANCE").map((item) => item.label);
    expect(labels).toEqual(["Cost Overview"]);
  });

  it("allows platform admins to see every milestone 1 operations route", () => {
    expect(allowedNav("PLATFORM_ADMIN").map((item) => item.href)).toEqual([
      "/dashboard",
      "/command-center",
      "/usage",
      "/security",
      "/tools",
      "/agents",
      "/costs",
      "/audit"
    ]);
  });
});
