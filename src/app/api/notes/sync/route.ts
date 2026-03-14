import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// POST /api/notes/sync
// Upserts text notes for one session to Supabase.
// Drawings are NEVER sent here — they stay in localStorage only.
// Called with 1500ms debounce after each guided prompt or free note change.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    session_key?: string;
    prompts?: string[];
    free_note?: string;
    notes_public?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.session_key !== "string" || !body.session_key) {
    return NextResponse.json({ error: "session_key is required" }, { status: 400 });
  }

  const db = createServiceClient();

  const { error } = await db.from("user_notes").upsert(
    {
      clerk_user_id: userId,
      session_key: body.session_key,
      prompts: Array.isArray(body.prompts) ? body.prompts : [],
      free_note: typeof body.free_note === "string" ? body.free_note : "",
      notes_public: typeof body.notes_public === "boolean" ? body.notes_public : true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id,session_key" }
  );

  if (error) {
    console.error("notes sync error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
