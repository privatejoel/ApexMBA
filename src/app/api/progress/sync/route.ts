import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// POST /api/progress/sync
// Pushes the user's completion map to Supabase.
// Merge strategy: union — a session marked done in either client or DB stays done.
// Called on first login (migration) and debounced after each toggleDone.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { done?: Record<string, boolean> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.done || typeof body.done !== "object") {
    return NextResponse.json({ error: "done must be an object" }, { status: 400 });
  }

  const db = createServiceClient();

  // Fetch existing DB value to merge (union of done sessions)
  const { data: existing } = await db
    .from("user_progress")
    .select("done")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  const serverDone: Record<string, boolean> = (existing?.done as Record<string, boolean>) ?? {};
  const clientDone: Record<string, boolean> = body.done;

  // Union: keep any session marked true in either source
  const merged: Record<string, boolean> = { ...serverDone };
  for (const [k, v] of Object.entries(clientDone)) {
    merged[k] = merged[k] || v;
  }

  const { data, error } = await db
    .from("user_progress")
    .upsert(
      { clerk_user_id: userId, done: merged, updated_at: new Date().toISOString() },
      { onConflict: "clerk_user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("progress sync error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ done: data.done });
}
