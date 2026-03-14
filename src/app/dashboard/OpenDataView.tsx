"use client";

import { useState, useEffect } from "react";
import type { OpenDataStats } from "@/lib/types";
import { WEEKS } from "@/lib/data";

// Build a lookup of session_key → topic for the heatmap labels
const SESSION_TOPICS: Record<string, string> = {};
for (const week of WEEKS) {
  for (let i = 0; i < week.days.length; i++) {
    SESSION_TOPICS[`w${week.number}d${i}`] = week.days[i].topic;
  }
}

// All 20 session keys in order
const ALL_KEYS: string[] = [];
for (const week of WEEKS) {
  for (let i = 0; i < week.days.length; i++) {
    ALL_KEYS.push(`w${week.number}d${i}`);
  }
}

interface StatCardProps {
  value: string | number;
  label: string;
  bg: string;
  color: string;
}

function StatCard({ value, label, bg, color }: StatCardProps) {
  return (
    <div style={{
      background: bg, borderRadius: 10, padding: "20px 16px", textAlign: "center",
      border: "1px solid rgba(255,255,255,0.1)",
    }}>
      <div style={{ fontSize: 34, fontWeight: "bold", color, lineHeight: 1 }}>{value}</div>
      <div style={{
        fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 6,
        fontFamily: "sans-serif", letterSpacing: 1.2, textTransform: "uppercase",
      }}>{label}</div>
    </div>
  );
}

export default function OpenDataView() {
  const [stats, setStats] = useState<OpenDataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/opendata")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load community stats.");
        setLoading(false);
      });
  }, []);

  // Sort sessions by completion count descending (top 10)
  const topSessions = stats
    ? Object.entries(stats.completion_by_session)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  const maxCount = topSessions[0]?.[1] ?? 1;

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: "normal", color: "#1a3a5c", margin: "0 0 6px", fontFamily: "Georgia,serif" }}>
          Community
        </h2>
        <p style={{ fontSize: 14, color: "#888", fontFamily: "sans-serif", margin: 0 }}>
          Open data from all ApexMBA learners — refreshed hourly.
        </p>
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderRadius: 10, background: "#e8e0f4", height: 80, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      )}

      {error && (
        <div style={{ color: "#c0392b", fontFamily: "sans-serif", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 32 }}>
            <StatCard value={stats.total_users.toLocaleString()} label="Total Learners" bg="#1a3a5c" color="#f0c040" />
            <StatCard value={stats.active_learners.toLocaleString()} label="Active Learners" bg="#27ae60" color="#fff" />
            <StatCard value={stats.avg_sessions_completed} label="Avg Sessions Done" bg="#7c4dab" color="#f0c040" />
            <StatCard value={stats.total_public_notes.toLocaleString()} label="Public Notes" bg="#0d1a2b" color="#7aadcf" />
          </div>

          {/* Completion heatmap — 4 weeks × 5 days */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#c0392b", letterSpacing: 3, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 14 }}>
              Session Completion
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {ALL_KEYS.map((key) => {
                const count = stats.completion_by_session[key] ?? 0;
                const pct = stats.active_learners > 0 ? count / stats.active_learners : 0;
                const opacity = 0.1 + pct * 0.9;
                const weekNum = parseInt(key.replace(/w(\d+)d\d+/, "$1"));
                const dayIdx = parseInt(key.replace(/w\d+d(\d+)/, "$1"));
                return (
                  <div
                    key={key}
                    title={`${SESSION_TOPICS[key] ?? key}: ${count} learner${count !== 1 ? "s" : ""} completed`}
                    style={{
                      background: `rgba(26,58,92,${opacity})`,
                      borderRadius: 6, padding: "10px 8px", textAlign: "center",
                      border: "1px solid rgba(26,58,92,0.15)", cursor: "default",
                    }}
                  >
                    <div style={{ fontSize: 10, color: pct > 0.4 ? "#fff" : "#555", fontFamily: "sans-serif" }}>
                      W{weekNum}D{dayIdx + 1}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: "bold", color: pct > 0.4 ? "#f0c040" : "#1a3a5c", marginTop: 2 }}>
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "#bbb", fontFamily: "sans-serif", marginTop: 8 }}>
              Hover cells to see session name. Darker = more completions.
            </div>
          </div>

          {/* Most completed sessions */}
          {topSessions.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#1a3a5c", letterSpacing: 3, textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 14 }}>
                Most Completed Sessions
              </div>
              {topSessions.map(([key, count]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontFamily: "sans-serif", color: "#7c4dab", minWidth: 40, fontWeight: "bold" }}>
                    {key.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, position: "relative", height: 24, background: "#f0eafa", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, height: "100%",
                      width: `${Math.round((count / maxCount) * 100)}%`,
                      background: "linear-gradient(90deg,#1a3a5c,#7c4dab)",
                      borderRadius: 4, transition: "width 0.4s ease",
                    }} />
                    <div style={{
                      position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)",
                      fontSize: 11, fontFamily: "sans-serif",
                      color: (count / maxCount) > 0.35 ? "#fff" : "#555",
                    }}>
                      {SESSION_TOPICS[key] ?? key}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#888", fontFamily: "sans-serif", minWidth: 28, textAlign: "right" }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div style={{ marginTop: 28, fontSize: 11, color: "#ccc", fontFamily: "sans-serif", lineHeight: 1.6 }}>
            Stats aggregate all public learner data and refresh hourly. No personal data is exposed in this view.
            All drawings are private and never included.
          </div>
        </>
      )}
    </div>
  );
}
