"use client";

import { useState, useEffect, useCallback } from "react";
import type { CommunityNote } from "@/lib/types";

interface CommunityNotesProps {
  sessionKey: string;
  sessionTopic: string;
  prompts: string[];
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NoteCardProps {
  note: CommunityNote;
  prompts: string[];
}

function NoteCard({ note, prompts }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasContent =
    note.prompts.some((p) => p.trim()) || note.free_note.trim();

  if (!hasContent) return null;

  return (
    <div style={{
      borderRadius: 7, border: "1px solid #e8e0f4", background: "#fdfbff",
      padding: "14px 16px", marginBottom: 10,
    }}>
      {/* Author row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c4dab,#1a3a5c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#fff", fontFamily: "sans-serif", fontWeight: "bold",
          }}>
            {note.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span style={{ fontSize: 13, color: "#1a3a5c", fontFamily: "sans-serif" }}>
              {note.display_name}
            </span>
            {note.is_anonymous && (
              <span style={{
                marginLeft: 6, fontSize: 9, background: "#ede6f5", color: "#7c4dab",
                borderRadius: 3, padding: "2px 6px", fontFamily: "sans-serif",
              }}>
                ANON
              </span>
            )}
          </div>
        </div>
        <span style={{ fontSize: 11, color: "#bbb", fontFamily: "sans-serif" }}>
          {timeAgo(note.updated_at)}
        </span>
      </div>

      {/* Content */}
      {note.prompts.map((answer, i) => {
        if (!answer.trim()) return null;
        const label = prompts[i] ? prompts[i].replace(/\*\*/g, "").slice(0, 60) : `Prompt ${i + 1}`;
        const preview = expanded ? answer : answer.slice(0, 140);
        return (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "#9b7fc0", fontFamily: "sans-serif", marginBottom: 3, letterSpacing: 0.3 }}>
              {label}
            </div>
            <div style={{ fontSize: 13, color: "#333", fontFamily: "Georgia,serif", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {preview}{!expanded && answer.length > 140 ? "…" : ""}
            </div>
          </div>
        );
      })}

      {note.free_note.trim() && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: "#9b7fc0", fontFamily: "sans-serif", marginBottom: 3, letterSpacing: 0.3 }}>
            FREE NOTES
          </div>
          <div style={{ fontSize: 13, color: "#333", fontFamily: "Georgia,serif", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {expanded ? note.free_note : note.free_note.slice(0, 140)}{!expanded && note.free_note.length > 140 ? "…" : ""}
          </div>
        </div>
      )}

      {(note.prompts.some((p) => p.length > 140) || note.free_note.length > 140) && (
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{
            marginTop: 8, background: "transparent", border: "none",
            fontSize: 11, color: "#7c4dab", cursor: "pointer", fontFamily: "sans-serif", padding: 0,
          }}
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
}

export default function CommunityNotes({ sessionKey, sessionTopic, prompts, onClose }: CommunityNotesProps) {
  const [notes, setNotes] = useState<CommunityNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotes = useCallback(async (off: number, append: boolean) => {
    try {
      const res = await fetch(`/api/notes/community?sessionKey=${sessionKey}&limit=5&offset=${off}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to load");
      if (append) {
        setNotes((prev) => [...prev, ...(body.notes ?? [])]);
      } else {
        setNotes(body.notes ?? []);
      }
      setHasMore(body.hasMore ?? false);
      setOffset(off + (body.notes?.length ?? 0));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load community notes");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    setLoading(true);
    setNotes([]);
    setOffset(0);
    fetchNotes(0, false);
  }, [fetchNotes]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchNotes(offset, true);
  };

  return (
    <div style={{
      marginTop: 16, borderRadius: 9, border: "1.5px solid #d4c6f0",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#f5f0ff,#fdf8ff)",
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #e0d4f5",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>👥</span>
          <span style={{ fontSize: 14, fontFamily: "Georgia,serif", color: "#4a2d80" }}>
            Community Notes
          </span>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "sans-serif" }}>
            — {sessionTopic}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "none", fontSize: 18,
            color: "#bbb", cursor: "pointer", lineHeight: 1,
          }}
        >×</button>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 16px" }}>
        {loading && (
          <div style={{ textAlign: "center", color: "#bbb", fontFamily: "sans-serif", fontSize: 13, padding: "20px 0" }}>
            Loading community notes…
          </div>
        )}

        {error && !loading && (
          <div style={{ color: "#c0392b", fontFamily: "sans-serif", fontSize: 13, padding: "8px 0" }}>
            {error}
          </div>
        )}

        {!loading && !error && notes.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 14, color: "#888", fontFamily: "sans-serif" }}>
              No community notes for this session yet.
            </div>
            <div style={{ fontSize: 12, color: "#bbb", fontFamily: "sans-serif", marginTop: 4 }}>
              Complete this session and write notes to be the first!
            </div>
          </div>
        )}

        {notes.map((note, i) => (
          <NoteCard key={i} note={note} prompts={prompts} />
        ))}

        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{
                background: "transparent", border: "1px solid #c9b8e0",
                borderRadius: 5, padding: "7px 18px",
                fontSize: 12, color: "#7c4dab", cursor: loadingMore ? "default" : "pointer",
                fontFamily: "sans-serif",
              }}
            >
              {loadingMore ? "Loading…" : "Load more notes"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "8px 16px", borderTop: "1px solid #f0eafa",
        fontSize: 10, color: "#bbb", fontFamily: "sans-serif", background: "#fdfbff",
      }}>
        Notes shared with learner consent. Manage sharing in Profile Settings.
      </div>
    </div>
  );
}
