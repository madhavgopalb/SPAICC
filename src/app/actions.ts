"use server";

import { RiskLevel, ToolStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createSyntheticEvent } from "@/lib/services/events";
import { convertAlertToIncident, resolveIncident } from "@/lib/services/security";
import { updateToolStatus } from "@/lib/services/tools";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function loginAction(_previousState: string | null, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return "Enter a valid demo email and password.";
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return "Invalid SAICC demo credentials.";
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function generateSyntheticEventAction() {
  const user = await requireUser();
  const event = await createSyntheticEvent(user.tenantId);
  if (event.riskLevel === RiskLevel.HIGH || event.riskLevel === RiskLevel.CRITICAL) {
    await prisma.securityAlert.create({
      data: {
        tenantId: user.tenantId,
        title: `${event.riskLevel.toLowerCase()} risk synthetic AI event`,
        description: `A privacy-safe ${event.promptCategory} event was detected for ${event.department}. Prompt content was not stored.`,
        source: "Live Command Center",
        riskLevel: event.riskLevel
      }
    });
  }
  revalidatePath("/command-center");
  revalidatePath("/dashboard");
}

export async function convertAlertAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "SECURITY" && user.role !== "PLATFORM_ADMIN") {
    throw new Error("Not authorized for SAICC security operations.");
  }
  const alertId = z.string().min(1).parse(formData.get("alertId"));
  await convertAlertToIncident(user, alertId);
  revalidatePath("/security");
  revalidatePath("/audit");
}

export async function resolveIncidentAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "SECURITY" && user.role !== "PLATFORM_ADMIN") {
    throw new Error("Not authorized for SAICC security operations.");
  }
  const incidentId = z.string().min(1).parse(formData.get("incidentId"));
  await resolveIncident(user, incidentId);
  revalidatePath("/security");
  revalidatePath("/audit");
}

export async function updateToolStatusAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "SECURITY" && user.role !== "PLATFORM_ADMIN") {
    throw new Error("Not authorized for SAICC tool governance.");
  }
  const toolId = z.string().min(1).parse(formData.get("toolId"));
  const status = z.nativeEnum(ToolStatus).parse(formData.get("status"));
  await updateToolStatus(user, toolId, status);
  revalidatePath("/tools");
  revalidatePath("/audit");
}
