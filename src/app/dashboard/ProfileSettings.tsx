"use client";

import { useState, useEffect, useCallback } from "react";

interface ProfileSettingsProps {
  onClose: () => void;
  notesPublicDefault: boolean;
  onNotesPublicDefaultChange: (val: boolean) => void;
}

export default function ProfileSettings({ onClose, notesPublicDefault, onNotesPublicDefaultChange }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinedAt, setJoinedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((body) => {
        if (body.profile) {
          setDisplayName(body.profile.display_name ?? "");
          setIsAnonymous(body.profile.is_anonymous ?? false);
          setJoinedAt(body.profile.joined_at ?? null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName.trim() || "Learner", is_anonymous: isAnonymous }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [displayName, isAnonymous]);

  const joinedDate = joinedAt
    ? new Date(joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(13,26,43,0.65)",
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Panel */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 12, width: "100%", maxWidth: 460,
            margin: "0 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px 16px", borderBottom: "1px solid #ede8f5",
          }}>
            <div>
              <div style={{ fontSize: 17, fontFamily: "Georgia,serif", color: "#1a3a5c" }}>Your Profile</div>
              <div style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", marginTop: 2 }}>
                How other learners see you
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent", border: "none", fontSize: 20, cursor: "pointer",
                color: "#bbb", lineHeight: 1, padding: "4px 8px",
              }}
            >×</button>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px 24px" }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "#bbb", fontFamily: "sans-serif", fontSize: 13, padding: "20px 0" }}>
                Loading…
              </div>
            ) : (
              <>
                {/* Display Name */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontFamily: "sans-serif", color: "#555", marginBottom: 6, letterSpacing: 0.3 }}>
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={60}
                    placeholder="Your display name"
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 6, boxSizing: "border-box",
                      border: "1.5px solid #d0c4e8", fontSize: 14, fontFamily: "Georgia,serif",
                      background: "#fdfbff", color: "#1a1a1a", outline: "none",
                    }}
                  />
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 5, fontFamily: "sans-serif" }}>
                    Shown to other learners when they view your notes or progress.
                  </div>
                </div>

                {/* Anonymous Mode */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontFamily: "sans-serif", color: "#333" }}>
                      Anonymous Mode
                    </label>
                    {/* Toggle switch */}
                    <div
                      onClick={() => setIsAnonymous((p) => !p)}
                      style={{
                        width: 42, height: 24, borderRadius: 12, cursor: "pointer", position: "relative",
                        background: isAnonymous ? "#27ae60" : "#ddd",
                        transition: "background 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 3, left: isAnonymous ? 21 : 3,
                        width: 18, height: 18, borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", lineHeight: 1.6 }}>
                    {isAnonymous
                      ? "Other learners see only your display name — not any account details."
                      : "Other learners see your display name. Enable this to hide all account details."}
                  </div>
                </div>

                {/* Notes public default */}
                <div style={{ marginBottom: 24, padding: "14px 16px", background: "#faf8ff", borderRadius: 8, border: "1px solid #ede6f5" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={notesPublicDefault}
                      onChange={(e) => onNotesPublicDefaultChange(e.target.checked)}
                      style={{ marginTop: 2, accentColor: "#7c4dab" }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontFamily: "sans-serif", color: "#333" }}>
                        Share my notes publicly by default
                      </div>
                      <div style={{ fontSize: 11, color: "#aaa", fontFamily: "sans-serif", marginTop: 3, lineHeight: 1.5 }}>
                        Other learners can read your guided and free notes. Drawings are always private.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    onClick={onClose}
                    style={{
                      background: "transparent", border: "none", fontSize: 13,
                      color: "#999", cursor: "pointer", fontFamily: "sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: "10px 28px", background: saving ? "#8a7ab0" : "#1a3a5c",
                      color: "#fff", border: "none", borderRadius: 6, fontSize: 14,
                      fontFamily: "sans-serif", cursor: saving ? "default" : "pointer",
                    }}
                  >
                    {saved ? "✓ Saved" : saving ? "Saving…" : "Save Profile"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {joinedDate && (
            <div style={{
              padding: "10px 24px 14px", borderTop: "1px solid #f0eafa",
              fontSize: 11, color: "#ccc", fontFamily: "sans-serif",
            }}>
              Joined {joinedDate}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
