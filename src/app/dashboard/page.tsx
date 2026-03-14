"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { WEEKS, TYPE_COLORS } from "@/lib/data";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";

const ExcalidrawCanvas = dynamic(() => import("./ExcalidrawWrapper"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "#fffef9", border: "1px solid #e0d4f0", borderRadius: 6, color: "#b0a0c0", fontFamily: "sans-serif", fontSize: 13 }}>
      Loading drawing canvas...
    </div>
  ),
});

/* ── Local-storage persistence keyed by userId ── */
function usePersistedState<T>(key: string, init: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(init);
  const { user } = useUser();
  const uid = user?.id;
  const storageKey = uid ? `apexmba_${uid}_${key}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  }, [storageKey]);

  return [state, set];
}

/* ── Hints panel ── */
function Hints({ hints }: { hints: { l: string; f: string; n: string }[] }) {
  const [open, setOpen] = useState(false);
  if (!hints?.length) return null;
  return (
    <div style={{ marginBottom: 16, border: "1.5px solid #c8e6c9", borderRadius: 8, overflow: "hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ background: open ? "#e8f5e9" : "#f1faf2", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: open ? "1px solid #c8e6c9" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span>🧮</span>
          <span style={{ fontSize: 13, fontWeight: "bold", color: "#2e7d32", fontFamily: "sans-serif" }}>Formulas & Ratios</span>
          <span style={{ fontSize: 10, background: "#2e7d32", color: "#fff", borderRadius: 10, padding: "2px 7px", fontFamily: "sans-serif" }}>{hints.length}</span>
        </div>
        <span style={{ fontSize: 12, color: "#43a047", fontFamily: "sans-serif" }}>{open ? "▲ Hide" : "▼ Show"}</span>
      </div>
      {open && (
        <div style={{ background: "#fff" }}>
          {hints.map((h, i) => (
            <div key={i} style={{ padding: "12px 14px", borderBottom: i < hints.length - 1 ? "1px solid #f0f7f1" : "none" }}>
              <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: "bold", color: "#2e7d32", marginBottom: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "#e8f5e9", fontSize: 9, marginRight: 6 }}>{i + 1}</span>{h.l}
              </div>
              <div style={{ background: "#0d1117", borderRadius: 5, padding: "7px 11px", marginBottom: 6, overflowX: "auto" }}>
                <code style={{ fontSize: 12, color: "#7ee787", fontFamily: "monospace", whiteSpace: "pre" }}>{h.f}</code>
              </div>
              <div style={{ fontSize: 12, color: "#388e3c", lineHeight: 1.6, padding: "5px 10px", background: "#f1f8e9", borderLeft: "3px solid #a5d6a7", borderRadius: "0 4px 4px 0", fontFamily: "sans-serif" }}>
                💡 {h.n}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Auto-resizing textarea ── */
function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [value]);
  return (
    <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", border: "1px solid #ddd", borderRadius: 5, padding: "10px 12px", fontFamily: "Georgia,serif", fontSize: 13, lineHeight: 1.7, resize: "none", outline: "none", background: "#fffef9", boxSizing: "border-box", overflow: "hidden", display: "block" }}
      onFocus={e => { e.target.style.borderColor = "#7c4dab"; e.target.style.boxShadow = "0 0 0 3px rgba(124,77,171,.08)"; }}
      onBlur={e => { e.target.style.borderColor = "#ddd"; e.target.style.boxShadow = "none"; }}
    />
  );
}

/* ── Markdown preview renderer ── */
const mdComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p style={{ fontSize: 13, lineHeight: 1.8, color: "#333", margin: "0 0 8px", fontFamily: "Georgia,serif" }}>{children}</p>,
  h1: ({ children }: { children?: React.ReactNode }) => <h1 style={{ fontSize: 20, fontWeight: "normal", color: "#1a1a1a", margin: "0 0 8px", fontFamily: "Georgia,serif" }}>{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 style={{ fontSize: 17, fontWeight: "normal", color: "#1a1a1a", margin: "0 0 8px", fontFamily: "Georgia,serif" }}>{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 style={{ fontSize: 15, fontWeight: "bold", color: "#1a1a1a", margin: "0 0 6px", fontFamily: "Georgia,serif" }}>{children}</h3>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong style={{ color: "#1a1a1a" }}>{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    className
      ? <pre style={{ background: "#0d1117", borderRadius: 5, padding: "7px 11px", overflowX: "auto", margin: "0 0 8px" }}><code style={{ fontSize: 12, color: "#7ee787", fontFamily: "monospace", whiteSpace: "pre" }}>{children}</code></pre>
      : <code style={{ background: "#f0eafa", color: "#4a2d80", fontFamily: "monospace", borderRadius: 3, padding: "1px 4px", fontSize: 12 }}>{children}</code>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul style={{ paddingLeft: 20, margin: "0 0 8px" }}>{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol style={{ paddingLeft: 20, margin: "0 0 8px" }}>{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li style={{ fontSize: 13, lineHeight: 1.8, fontFamily: "sans-serif", color: "#333" }}>{children}</li>,
  blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote style={{ borderLeft: "3px solid #c9b8e0", paddingLeft: 12, color: "#888", margin: "0 0 8px", fontStyle: "italic" }}>{children}</blockquote>,
};
function MarkdownContent({ content }: { content: string }) {
  return <div style={{ padding: "10px 12px", background: "#fffef9", borderRadius: 5, border: "1px solid #ede6f5", minHeight: 40 }}><ReactMarkdown components={mdComponents}>{content}</ReactMarkdown></div>;
}

type Notes = Record<string, { prompts: string[]; freeNote: string; drawing?: string }>;
type Done = Record<string, boolean>;
type NoteTab = Record<string, "guided" | "free" | "draw">;

export default function Dashboard() {
  const { user } = useUser();
  const [view, setView] = useState<"plan" | "module" | "notes">("module");
  const [activeWeek, setActiveWeek] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [done, setDone] = usePersistedState<Done>("done", {});
  const [notes, setNotes] = usePersistedState<Notes>("notes", {});
  const [noteTab, setNoteTab] = useState<NoteTab>({});
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);

  const getPreview = (k: string) => previewMode[k] ?? false;
  const togglePreview = (k: string) => setPreviewMode(p => ({ ...p, [k]: !p[k] }));

  const toggleDone = (k: string) => setDone(p => ({ ...p, [k]: !p[k] }));
  const toggleExp = (k: string) => setExpanded(p => p === k ? null : k);
  const getTab = (k: string) => noteTab[k] ?? "guided";
  const setTab = (k: string, t: "guided" | "free" | "draw") => setNoteTab(p => ({ ...p, [k]: t }));
  const getPN = (k: string, i: number) => notes[k]?.prompts?.[i] ?? "";
  const setPN = (k: string, i: number, v: string) => setNotes(p => {
    const pr = [...(p[k]?.prompts ?? [])]; pr[i] = v;
    return { ...p, [k]: { ...p[k], prompts: pr, freeNote: p[k]?.freeNote ?? "" } };
  });
  const getFN = (k: string) => notes[k]?.freeNote ?? "";
  const setFN = (k: string, v: string) => setNotes(p => ({ ...p, [k]: { ...p[k], freeNote: v, prompts: p[k]?.prompts ?? [] } }));
  const getDR = (k: string): string => notes[k]?.drawing ?? "";
  const setDR = (k: string, v: string) => setNotes(p => ({ ...p, [k]: { ...p[k], drawing: v, prompts: p[k]?.prompts ?? [], freeNote: p[k]?.freeNote ?? "" } }));
  const hasDrawing = (k: string) => {
    const dr = notes[k]?.drawing;
    if (!dr) return false;
    try { const els = JSON.parse(dr); return Array.isArray(els) && els.length > 0; } catch { return false; }
  };
  const hasNote = (k: string) => {
    const n = notes[k];
    if (!n) return false;
    if ((n.prompts ?? []).some(s => s?.trim())) return true;
    if ((n.freeNote ?? "").trim()) return true;
    if (hasDrawing(k)) return true;
    return false;
  };

  const total = WEEKS.reduce((s, w) => s + w.days.length, 0);
  const completed = Object.values(done).filter(Boolean).length;
  const pct = Math.round(completed / total * 100);

  const allNoted = WEEKS.flatMap(w => w.days.map((d, di) => ({ key: `w${w.number}d${di}`, w, d }))).filter(x => hasNote(x.key));

  const curriculum = [
    { year: "Track 1 — Core Finance & Strategy", color: "#1a3a5c", subjects: [
      { name: "Finance I", abbr: "FIN I", weeks: 4, active: true },
      { name: "Financial Reporting & Control", abbr: "FRC", weeks: 4 },
      { name: "Leadership & Org. Behavior", abbr: "LEAD", weeks: 3 },
      { name: "Marketing", abbr: "MKT", weeks: 3 },
      { name: "Technology & Operations Mgmt", abbr: "TOM", weeks: 3 },
      { name: "Strategy", abbr: "STR", weeks: 3 },
    ]},
    { year: "Track 2 — Advanced & Applied", color: "#c0392b", subjects: [
      { name: "Data Science & AI for Leaders", abbr: "DSAI", weeks: 3 },
      { name: "Business, Govt & Global Economy", abbr: "BGGE", weeks: 3 },
      { name: "The Entrepreneurial Manager", abbr: "TEM", weeks: 3 },
      { name: "Finance II", abbr: "FIN II", weeks: 3 },
      { name: "Leadership & Corp. Accountability", abbr: "LCA", weeks: 3 },
      { name: "Global Business Capstone", abbr: "GBC", weeks: 2 },
      { name: "The Purpose of the Firm", abbr: "PTF", weeks: 2 },
    ]},
  ];

  const navItems = [
    { k: "plan" as const, label: "📚 Curriculum" },
    { k: "module" as const, label: "Finance I" },
    { k: "notes" as const, label: allNoted.length > 0 ? `📓 Notes (${allNoted.length})` : "📓 Notes" },
  ];

  return (
    <div style={{ fontFamily: "Georgia,serif", background: "#f7f4ef", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#0d1a2b", borderBottom: "3px solid #1a3a5c", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 24, height: 24, background: "linear-gradient(135deg,#1a3a5c,#c0392b)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>▲</div>
            <span style={{ color: "#fff", fontSize: 16 }}>ApexMBA</span>
          </Link>
          <div style={{ display: "flex", gap: 5, flex: 1, justifyContent: "center" }}>
            {navItems.map(({ k, label }) => (
              <button key={k} onClick={() => setView(k)} style={{ padding: "6px 14px", background: view === k ? "#1a3a5c" : "transparent", color: view === k ? "#fff" : "#7aadcf", border: `1px solid ${view === k ? "#2a5a8c" : "#1e3050"}`, borderRadius: 4, cursor: "pointer", fontSize: 12, fontFamily: "sans-serif" }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#5a8aaa", fontFamily: "sans-serif", fontSize: 12 }}>{user?.firstName}</span>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── CURRICULUM ── */}
        {view === "plan" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: "normal", margin: "0 0 8px" }}>Your Learning Roadmap</h2>
            <p style={{ color: "#555", fontSize: 14, fontFamily: "sans-serif", lineHeight: 1.7, maxWidth: 660, margin: "0 0 32px" }}>Progress one module at a time through cases and practical assignments.</p>
            {curriculum.map(track => (
              <div key={track.year} style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: track.color }} />
                  <h3 style={{ margin: 0, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "#888", fontFamily: "sans-serif" }}>{track.year}</h3>
                  <div style={{ flex: 1, height: 1, background: "#ddd" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
                  {track.subjects.map(sub => (
                    <div key={sub.abbr} onClick={() => sub.active && setView("module")}
                      style={{ background: sub.active ? "#fff" : "#fafafa", border: sub.active ? `2px solid ${track.color}` : "1px solid #e5e5e5", borderRadius: 8, padding: "15px 17px", cursor: sub.active ? "pointer" : "default", opacity: sub.active ? 1 : 0.5, position: "relative", overflow: "hidden" }}>
                      {sub.active && <div style={{ position: "absolute", top: 0, right: 0, background: track.color, color: "#fff", fontSize: 8, padding: "2px 7px", fontFamily: "sans-serif" }}>Active</div>}
                      <div style={{ fontSize: 9, fontFamily: "sans-serif", letterSpacing: 1.5, color: track.color, textTransform: "uppercase", marginBottom: 4 }}>{sub.abbr}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.4, marginBottom: 7 }}>{sub.name}</div>
                      <div style={{ display: "flex", gap: 8, fontFamily: "sans-serif", fontSize: 10, color: "#aaa" }}>
                        <span>⏱ {sub.weeks}w</span>
                        {sub.active ? <span style={{ color: track.color }}>→ Open</span> : <span>🔒</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── NOTES ── */}
        {view === "notes" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: "normal", margin: "0 0 4px" }}>My Notes</h2>
                <p style={{ color: "#888", fontFamily: "sans-serif", fontSize: 13, margin: 0 }}>{allNoted.length === 0 ? "No notes yet — expand a session in Finance I." : `${allNoted.length} session${allNoted.length > 1 ? "s" : ""} with notes`}</p>
              </div>
              {allNoted.length > 0 && <button onClick={() => setView("module")} style={{ padding: "7px 15px", background: "transparent", border: "1px solid #1a3a5c", color: "#1a3a5c", borderRadius: 4, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13 }}>+ Add Notes</button>}
            </div>
            {allNoted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "68px 40px", background: "#fff", borderRadius: 10, border: "1px solid #e5e5e5" }}>
                <div style={{ fontSize: 38, marginBottom: 12 }}>📓</div>
                <div style={{ fontSize: 15, color: "#bbb", fontFamily: "sans-serif", marginBottom: 16 }}>Your notebook is empty</div>
                <button onClick={() => setView("module")} style={{ padding: "9px 22px", background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13 }}>Open Finance I →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {allNoted.map(({ key, w, d }) => {
                  const tc = TYPE_COLORS[d.type] ?? TYPE_COLORS["Review"];
                  const pn = notes[key]?.prompts ?? [];
                  const fn = notes[key]?.freeNote ?? "";
                  return (
                    <div key={key} style={{ background: "#fff", border: "1px solid #e8e0f0", borderRadius: 9, overflow: "hidden" }}>
                      <div style={{ padding: "12px 18px", background: "#f9f6ff", borderBottom: "1px solid #e8e0f0", display: "flex", gap: 11, alignItems: "center" }}>
                        <span style={{ fontFamily: "sans-serif", fontSize: 10, color: "#aaa" }}>Wk {w.number} · {d.day}</span>
                        <span style={{ fontSize: 15, flex: 1 }}>{d.topic}</span>
                        <span style={{ padding: "2px 8px", background: tc.bg, color: tc.tx, border: `1px solid ${tc.bd}`, borderRadius: 3, fontSize: 10, fontFamily: "sans-serif" }}>{d.type}</span>
                        <button onClick={() => {
                          setView("module"); setActiveWeek(w.number - 1); setExpanded(key);
                          const n = notes[key];
                          const hasTextNotes = (n?.prompts ?? []).some(s => s?.trim()) || (n?.freeNote ?? "").trim();
                          if (!hasTextNotes && n?.drawing) { try { const els = JSON.parse(n.drawing); if (Array.isArray(els) && els.length > 0) setTab(key, "draw"); } catch {} }
                        }} style={{ padding: "3px 10px", background: "transparent", border: "1px solid #c9b8e0", borderRadius: 3, cursor: "pointer", fontSize: 11, fontFamily: "sans-serif", color: "#7c4dab" }}>Edit ✏️</button>
                      </div>
                      <div style={{ padding: "15px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {d.prompts.map((pr, i) => pn[i]?.trim() ? (
                          <div key={i}>
                            <div style={{ fontSize: 10, color: "#9b80c0", fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 3 }}>{pr}</div>
                            <MarkdownContent content={pn[i]} />
                          </div>
                        ) : null)}
                        {fn.trim() && (
                          <div>
                            <div style={{ fontSize: 10, color: "#9b80c0", fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 3 }}>Free Notes</div>
                            <MarkdownContent content={fn} />
                          </div>
                        )}
                        {(() => {
                          const dr = notes[key]?.drawing;
                          if (!dr) return null;
                          let els: unknown[];
                          try { els = JSON.parse(dr); } catch { return null; }
                          if (!Array.isArray(els) || els.length === 0) return null;
                          return (
                            <div>
                              <div style={{ fontSize: 10, color: "#9b80c0", fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 3 }}>Drawing</div>
                              <div style={{ fontSize: 12, color: "#888", padding: "12px", background: "#fffef9", border: "1px solid #ede6f5", borderRadius: 4, fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 18 }}>🎨</span>
                                <span>{els.length} element{els.length !== 1 ? "s" : ""}</span>
                                <button onClick={() => { setView("module"); setActiveWeek(w.number - 1); setExpanded(key); setTab(key, "draw"); }} style={{ marginLeft: "auto", padding: "3px 10px", background: "transparent", border: "1px solid #c9b8e0", borderRadius: 3, cursor: "pointer", fontSize: 11, fontFamily: "sans-serif", color: "#7c4dab" }}>Open Drawing</button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── FINANCE I ── */}
        {view === "module" && (
          <div>
            {/* Module header */}
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderLeft: "5px solid #1a3a5c", borderRadius: "0 8px 8px 0", padding: "20px 24px", marginBottom: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 2.5, color: "#1a3a5c", fontFamily: "sans-serif", textTransform: "uppercase", marginBottom: 4 }}>Track 1 · Module 1 of 6</div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: "normal" }}>Finance I</h2>
                  <p style={{ margin: "0 0 5px", color: "#555", fontSize: 14, fontFamily: "sans-serif" }}>Value creation, capital, and financial decision-making</p>
                  <div style={{ fontSize: 11, color: "#888", fontFamily: "sans-serif" }}>📅 4 weeks · ~90 min/day</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: "bold", color: "#1a3a5c", lineHeight: 1 }}>{pct}%</div>
                  <div style={{ fontSize: 10, color: "#888", fontFamily: "sans-serif" }}>Complete</div>
                  <div style={{ height: 5, background: "#eee", borderRadius: 3, width: 100, marginTop: 6 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#1a3a5c,#2980b9)", borderRadius: 3, transition: "width .4s" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#aaa", fontFamily: "sans-serif", marginTop: 3 }}>{completed}/{total} sessions</div>
                </div>
              </div>
            </div>

            {/* Week tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {WEEKS.map((w, i) => (
                <button key={i} onClick={() => setActiveWeek(i)} style={{ padding: "9px 20px", background: activeWeek === i ? "#0d1a2b" : "#fff", color: activeWeek === i ? "#fff" : "#555", border: `1px solid ${activeWeek === i ? "#0d1a2b" : "#ddd"}`, borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: "sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                  Week {w.number}
                </button>
              ))}
            </div>

            {/* Week content */}
            {(() => {
              const week = WEEKS[activeWeek];
              return (
                <div>
                  <div style={{ background: "#0d1a2b", color: "#fff", padding: "14px 18px", borderRadius: "8px 8px 0 0" }}>
                    <div style={{ fontSize: 10, letterSpacing: 2.5, color: "#5a8aaa", fontFamily: "sans-serif", textTransform: "uppercase" }}>Week {week.number}</div>
                    <h3 style={{ margin: "3px 0 0", fontSize: 18, fontWeight: "normal" }}>{week.theme}</h3>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderTop: "none", borderRadius: "0 0 8px 8px" }}>
                    {week.days.map((day, di) => {
                      const key = `w${week.number}d${di}`;
                      const isDone = done[key];
                      const isExpanded = expanded === key;
                      const tc = TYPE_COLORS[day.type] ?? TYPE_COLORS["Review"];
                      const tab = getTab(key);
                      const noted = hasNote(key);
                      return (
                        <div key={di} style={{ borderBottom: di < week.days.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                          <div onClick={() => toggleExp(key)} style={{ padding: "15px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: isDone ? "#f6fff8" : "transparent" }}>
                            <div onClick={e => { e.stopPropagation(); toggleDone(key); }}
                              style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `2px solid ${isDone ? "#27ae60" : "#ddd"}`, background: isDone ? "#27ae60" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 11 }}>
                              {isDone ? "✓" : ""}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 10, color: "#bbb", fontFamily: "sans-serif", marginBottom: 2 }}>{day.day}</div>
                              <div style={{ fontSize: 15, color: isDone ? "#aaa" : "#1a1a1a", textDecoration: isDone ? "line-through" : "none" }}>{day.topic}</div>
                            </div>
                            {noted && <span style={{ fontSize: 11, opacity: .6 }}>📓</span>}
                            {hasDrawing(key) && <span style={{ fontSize: 11, opacity: .6 }}>🎨</span>}
                            <span style={{ padding: "3px 9px", background: tc.bg, color: tc.tx, border: `1px solid ${tc.bd}`, borderRadius: 3, fontSize: 10, fontFamily: "sans-serif", flexShrink: 0 }}>{day.type}</span>
                            <span style={{ color: "#bbb", fontSize: 14, display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                          </div>
                          {isExpanded && (
                            <div style={{ padding: "10px 18px 24px 68px" }}>
                              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#444", lineHeight: 1.75, fontFamily: "sans-serif" }}>{day.desc}</p>
                              <div style={{ background: "#fffbf0", border: "1px solid #f0d080", borderLeft: "4px solid #f39c12", borderRadius: "0 6px 6px 0", padding: "12px 16px", marginBottom: 16 }}>
                                <div style={{ fontSize: 9, letterSpacing: 1.5, color: "#e67e22", textTransform: "uppercase", marginBottom: 5, fontFamily: "sans-serif" }}>📝 Assignment</div>
                                <div style={{ fontSize: 14, color: "#3d2b00", lineHeight: 1.7, fontFamily: "sans-serif" }}>{day.task}</div>
                              </div>
                              <Hints hints={day.hints} />
                              {/* Notes */}
                              <div style={{ border: "1.5px solid #e0d4f0", borderRadius: 9, overflow: "hidden" }}>
                                <div style={{ background: "linear-gradient(135deg,#f5f0ff,#fdf8ff)", padding: "10px 14px", borderBottom: "1px solid #e0d4f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <span>📓</span>
                                    <span style={{ fontSize: 13, fontWeight: "bold", color: "#4a2d80", fontFamily: "sans-serif" }}>My Notes</span>
                                    {noted && <span style={{ fontSize: 9, background: "#4a2d80", color: "#fff", borderRadius: 10, padding: "2px 8px", fontFamily: "sans-serif" }}>saved</span>}
                                    {tab !== "draw" && (
                                      <button onClick={() => togglePreview(key)} style={{ fontSize: 10, fontFamily: "sans-serif", padding: "3px 9px", background: getPreview(key) ? "#4a2d80" : "transparent", color: getPreview(key) ? "#fff" : "#9b7fc0", border: "1px solid #c9b8e0", borderRadius: 4, cursor: "pointer" }}>
                                        {getPreview(key) ? "✏️ Edit" : "👁 Preview"}
                                      </button>
                                    )}
                                  </div>
                                  <div style={{ display: "flex", background: "#ede4fc", borderRadius: 6, padding: 3, gap: 2 }}>
                                    {(["guided", "free", "draw"] as const).map(t => (
                                      <button key={t} onClick={() => setTab(key, t)} style={{ padding: "5px 11px", fontSize: 11, fontFamily: "sans-serif", background: tab === t ? "#fff" : "transparent", color: tab === t ? "#4a2d80" : "#9b7fc0", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: tab === t ? "bold" : "normal" }}>
                                        {t === "guided" ? "Guided" : t === "free" ? "Free Notes" : "Draw"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div style={{ padding: "14px", background: "#fff" }}>
                                  {tab === "guided" && day.prompts.map((prompt, pi) => (
                                    <div key={pi} style={{ marginBottom: 14 }}>
                                      <label style={{ display: "block", fontSize: 12, color: "#6a3fa0", marginBottom: 5, fontWeight: "bold", fontFamily: "sans-serif" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#ede4fc", color: "#4a2d80", borderRadius: "50%", width: 16, height: 16, fontSize: 9, marginRight: 5 }}>{pi + 1}</span>
                                        {prompt}
                                      </label>
                                      {getPreview(key)
                                        ? getPN(key, pi).trim()
                                          ? <MarkdownContent content={getPN(key, pi)} />
                                          : <div style={{ fontSize: 12, color: "#ccc", fontStyle: "italic", fontFamily: "sans-serif", padding: "10px 12px" }}>Nothing written yet.</div>
                                        : <Textarea value={getPN(key, pi)} onChange={v => setPN(key, pi, v)} placeholder="Write your answer here..." rows={2} />}
                                    </div>
                                  ))}
                                  {tab === "free" && (
                                    <div>
                                      {!getPreview(key) && <div style={{ fontSize: 12, color: "#b0a0c0", marginBottom: 7, fontStyle: "italic", fontFamily: "sans-serif" }}>Raw thoughts, questions, connections to your work...</div>}
                                      {getPreview(key)
                                        ? getFN(key).trim()
                                          ? <MarkdownContent content={getFN(key)} />
                                          : <div style={{ fontSize: 12, color: "#ccc", fontStyle: "italic", fontFamily: "sans-serif", padding: "10px 12px" }}>Nothing written yet.</div>
                                        : <Textarea value={getFN(key)} onChange={v => setFN(key, v)} placeholder="Free-form notes for this session..." rows={4} />}
                                    </div>
                                  )}
                                  {tab === "draw" && (
                                    <div>
                                      <div style={{ fontSize: 12, color: "#b0a0c0", marginBottom: 7, fontStyle: "italic", fontFamily: "sans-serif" }}>Sketch diagrams, frameworks, and visual notes...</div>
                                      <ExcalidrawCanvas
                                        key={key}
                                        initialElements={getDR(key) ? (() => { try { return JSON.parse(getDR(key)); } catch { return null; } })() : null}
                                        onSave={(elements) => setDR(key, JSON.stringify(elements))}
                                      />
                                    </div>
                                  )}
                                  <div style={{ marginTop: 10, fontSize: 11, color: "#c0b0d0", textAlign: "right", fontFamily: "sans-serif" }}>
                                    Saved locally in your browser · <span onClick={() => setView("notes")} style={{ color: "#7c4dab", cursor: "pointer", textDecoration: "underline" }}>View all notes →</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Week nav */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setActiveWeek(w => Math.max(0, w - 1))} disabled={activeWeek === 0}
                style={{ padding: "9px 22px", background: "transparent", border: "1px solid #ddd", borderRadius: 4, cursor: activeWeek === 0 ? "not-allowed" : "pointer", color: activeWeek === 0 ? "#ccc" : "#555", fontFamily: "sans-serif", fontSize: 13 }}>
                ← Previous Week
              </button>
              {activeWeek < WEEKS.length - 1 ? (
                <button onClick={() => setActiveWeek(w => w + 1)} style={{ padding: "9px 22px", background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13 }}>Next Week →</button>
              ) : (
                <button onClick={() => setView("plan")} style={{ padding: "9px 22px", background: "#0d1a2b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13 }}>Complete & View Plan →</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "#080f18", padding: "18px 24px", marginTop: 40 }}>
        <p style={{ maxWidth: 1100, margin: "0 auto", fontSize: 11, color: "#2a4a60", fontFamily: "sans-serif", lineHeight: 1.7 }}>
          ApexMBA is an open source self-study platform not affiliated with Harvard University or Harvard Business School. Licensed under MIT.
        </p>
      </div>
    </div>
  );
}
