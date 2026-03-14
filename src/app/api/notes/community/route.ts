import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { CommunityNote } from "@/lib/types";

// GET /api/notes/community?sessionKey=w1d0&limit=5&offset=0
// Returns other users' public notes for a session.
// Public — no auth required.
// Cached at Vercel edge for 1 minute.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionKey = searchParams.get("sessionKey");
  if (!sessionKey) {
    return NextResponse.json({ error: "sessionKey is required" }, { status: 400 });
  }

  const limit = Math.min(parseInt(searchParams.get("limit") ?? "5", 10), 20);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);

  const db = createServiceClient();

  // Join user_notes with user_profiles to get display_name and is_anonymous
  // Never expose clerk_user_id in the response
  const { data, error } = await db
    .from("user_notes")
    .select(`
      prompts,
      free_note,
      updated_at,
      user_profiles!inner ( display_name, is_anonymous )
    `)
    .eq("session_key", sessionKey)
    .eq("notes_public", true)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("community notes error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const notes: CommunityNote[] = (data ?? []).map((row) => {
    const profile = Array.isArray(row.user_profiles) ? row.user_profiles[0] : row.user_profiles;
    return {
      display_name: profile?.display_name ?? "Learner",
      is_anonymous: profile?.is_anonymous ?? false,
      prompts: (row.prompts as string[]) ?? [],
      free_note: row.free_note ?? "",
      updated_at: row.updated_at,
    };
  });

  return NextResponse.json(
    { notes, hasMore: notes.length === limit },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    }
  );
}
