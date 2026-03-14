import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceClient } from "@/lib/supabase";

// POST /api/webhooks/clerk
// Handles Clerk user lifecycle events.
// On user.deleted: cascade-deletes the user_profiles row (which cascades to user_progress and user_notes).
// Configure this endpoint URL in Clerk dashboard → Webhooks.
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let event: { type: string; data: { id?: string } };
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: { id?: string } };
  } catch (err) {
    console.error("Webhook verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.deleted") {
    const userId = event.data.id;
    if (!userId) return NextResponse.json({ ok: true });

    const db = createServiceClient();
    const { error } = await db
      .from("user_profiles")
      .delete()
      .eq("clerk_user_id", userId);

    if (error) {
      console.error("user delete cascade error", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
