import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only created on first call so that build-time static analysis
// doesn't fail when NEXT_PUBLIC_SUPABASE_URL is not yet set.
let _anonClient: SupabaseClient | null = null;

// Public/anon client — used for reads that don't require auth (community notes, stats)
// RLS policies allow SELECT for everyone on these tables
export function getAnonClient(): SupabaseClient {
  if (!_anonClient) {
    _anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _anonClient;
}

// Authenticated client — injects a Clerk JWT so RLS can verify the writer is the owner
// Usage: const db = createAuthClient(await getToken({ template: "supabase" }))
export function createAuthClient(clerkToken: string): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${clerkToken}` },
      },
    }
  );
}

// Server-side admin client — used only in API routes with service role key
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser
export function createServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } }
  );
}
