import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSyntheticEvent } from "@/lib/services/events";

export async function POST() {
  const user = await requireUser();
  const event = await createSyntheticEvent(user.tenantId);
  return NextResponse.json({ eventId: event.id, riskLevel: event.riskLevel });
}
