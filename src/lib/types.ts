// ─── Shared TypeScript interfaces for ApexMBA community features ───────────────

export interface UserProfile {
  clerk_user_id: string;
  display_name: string;
  is_anonymous: boolean;
  joined_at: string;
  updated_at: string;
}

export interface UserProgress {
  clerk_user_id: string;
  done: Record<string, boolean>;
  updated_at: string;
}

export interface UserNotes {
  clerk_user_id: string;
  session_key: string;
  prompts: string[];
  free_note: string;
  notes_public: boolean;
  updated_at: string;
}

// Community-facing note (no clerk_user_id exposed)
export interface CommunityNote {
  display_name: string;
  is_anonymous: boolean;
  prompts: string[];
  free_note: string;
  updated_at: string;
}

export interface OpenDataStats {
  total_users: number;
  active_learners: number;
  avg_sessions_completed: number;
  total_public_notes: number;
  completion_by_session: Record<string, number>;
}
