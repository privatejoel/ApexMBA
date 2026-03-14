import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { OpenDataStats } from "@/lib/types";

// GET /api/opendata
// Returns aggregate community stats.
// Public — no auth required.
// Cached at Vercel edge for 1 hour to avoid repeated aggregation queries.
export async function GET() {
  const db = createServiceClient();

  // Run all aggregate queries in parallel
  const [profilesRes, progressRes, notesRes] = await Promise.all([
    // Total registered users
    db.from("user_profiles").select("*", { count: "exact", head: true }),

    // All users' done maps (to compute active learners + avg sessions + per-session counts)
    db.from("user_progress").select("done"),

    // Total public notes
    db.from("user_notes").select("*", { count: "exact", head: true }).eq("notes_public", true),
  ]);

  if (profilesRes.error || progressRes.error || notesRes.error) {
    console.error("opendata error", profilesRes.error, progressRes.error, notesRes.error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const totalUsers = profilesRes.count ?? 0;
  const totalPublicNotes = notesRes.count ?? 0;

  // Compute active learners (at least 1 session completed) + avg + per-session counts
  const progressRows: { done: Record<string, boolean> }[] = (progressRes.data ?? []) as { done: Record<string, boolean> }[];
  const completionBySession: Record<string, number> = {};
  let activeLearners = 0;
  let totalSessionsCompleted = 0;

  for (const row of progressRows) {
    const done = row.done ?? {};
    const count = Object.values(done).filter(Boolean).length;
    if (count > 0) {
      activeLearners++;
      totalSessionsCompleted += count;
    }
    for (const [key, val] of Object.entries(done)) {
      if (val) {
        completionBySession[key] = (completionBySession[key] ?? 0) + 1;
      }
    }
  }

  const avgSessionsCompleted =
    activeLearners > 0 ? Math.round((totalSessionsCompleted / activeLearners) * 10) / 10 : 0;

  const stats: OpenDataStats = {
    total_users: totalUsers,
    active_learners: activeLearners,
    avg_sessions_completed: avgSessionsCompleted,
    total_public_notes: totalPublicNotes,
    completion_by_session: completionBySession,
  };

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
    },
  });
}
