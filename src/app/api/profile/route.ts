import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// POST /api/profile
// Upserts the authenticated user's public profile.
// Called on first dashboard load (migration) and from ProfileSettings on save.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { display_name?: string; is_anonymous?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const display_name = typeof body.display_name === "string" ? body.display_name.trim().slice(0, 60) : undefined;
  const is_anonymous = typeof body.is_anonymous === "boolean" ? body.is_anonymous : undefined;

  const db = createServiceClient();

  // Upsert — create on first visit, update on subsequent calls
  const { data, error } = await db
    .from("user_profiles")
    .upsert(
      {
        clerk_user_id: userId,
        ...(display_name !== undefined && { display_name }),
        ...(is_anonymous !== undefined && { is_anonymous }),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    console.error("profile upsert error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

// GET /api/profile
// Returns the authenticated user's own profile.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceClient();
  const { data, error } = await db
    .from("user_profiles")
    .select("clerk_user_id, display_name, is_anonymous, joined_at")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  if (!data) return NextResponse.json({ profile: null });

  return NextResponse.json({ profile: data });
}
