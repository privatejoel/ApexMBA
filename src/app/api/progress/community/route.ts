import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/progress/community?sessionKey=w1d0
// Returns how many learners have completed a given session.
// Public — no auth required.
// Cached at Vercel edge for 5 minutes to avoid repeated DB reads.
export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get("sessionKey");
  if (!sessionKey) {
    return NextResponse.json({ error: "sessionKey is required" }, { status: 400 });
  }

  const db = createServiceClient();

  // Count rows where the done JSONB object contains this session key as true
  const { count, error } = await db
    .from("user_progress")
    .select("*", { count: "exact", head: true })
    .eq(`done->>${sessionKey}`, "true");

  if (error) {
    console.error("community progress error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json(
    { sessionKey, completedCount: count ?? 0 },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
