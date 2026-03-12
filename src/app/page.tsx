"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const curriculum = [
  {
    year: "Track 1 — Core Finance & Strategy",
    color: "#1a3a5c",
    subjects: [
      { name: "Finance I", abbr: "FIN I", weeks: 4, active: true },
      { name: "Financial Reporting & Control", abbr: "FRC", weeks: 4 },
      { name: "Leadership & Org. Behavior", abbr: "LEAD", weeks: 3 },
      { name: "Marketing", abbr: "MKT", weeks: 3 },
      { name: "Technology & Operations Mgmt", abbr: "TOM", weeks: 3 },
      { name: "Strategy", abbr: "STR", weeks: 3 },
    ],
  },
  {
    year: "Track 2 — Advanced & Applied",
    color: "#c0392b",
    subjects: [
      { name: "Data Science & AI for Leaders", abbr: "DSAI", weeks: 3 },
      { name: "Business, Govt & Global Economy", abbr: "BGGE", weeks: 3 },
      { name: "The Entrepreneurial Manager", abbr: "TEM", weeks: 3 },
      { name: "Finance II", abbr: "FIN II", weeks: 3 },
      { name: "Leadership & Corp. Accountability", abbr: "LCA", weeks: 3 },
      { name: "Global Business Capstone", abbr: "GBC", weeks: 2 },
      { name: "The Purpose of the Firm", abbr: "PTF", weeks: 2 },
    ],
  },
];

const features = [
  { icon: "🗂️", t: "13-Subject Curriculum", d: "Two tracks covering Finance, Strategy, Marketing, Operations, and Leadership — sequenced from fundamentals to advanced." },
  { icon: "📋", t: "Case Method Learning", d: "Every session anchored in a real case: Amazon, Netflix, Hertz, Disney/Pixar. Study the way practitioners do." },
  { icon: "🧮", t: "Formula Hints", d: "Expandable toolkits of formulas and frameworks, with context on how to apply each one." },
  { icon: "📝", t: "Guided Notes", d: "Structured prompts per session plus free-form mode. Notes save to your account." },
  { icon: "✅", t: "Progress Tracking", d: "Mark sessions complete. Progress saves locally in your browser — tied to your account." },
  { icon: "⚡", t: "Daily Intensive Format", d: "~90 minutes per session. Weekly themes build progressively on prior learning." },
  { icon: "🌐", t: "Open Source Curriculum", d: "Every lesson, case, and framework is open source under MIT. Fork it, improve it, contribute back." },
  { icon: "🤝", t: "Community Driven", d: "Suggest new cases, vote on subjects, and help build the curriculum. This MBA belongs to its learners." },
];

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#f7f4ef", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ background: "#0d1a2b", padding: "0 48px", borderBottom: "1px solid #1e3050", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#1a3a5c,#c0392b)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff" }}>▲</div>
            <span style={{ color: "#fff", fontSize: 18 }}>ApexMBA</span>
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/sign-in" style={{ padding: "8px 20px", background: "transparent", color: "#a8c4dc", border: "1px solid #2a5080", borderRadius: 5, fontFamily: "sans-serif", fontSize: 13, textDecoration: "none" }}>Sign In</Link>
            <Link href="/sign-up" style={{ padding: "8px 20px", background: "#c0392b", color: "#fff", borderRadius: 5, fontFamily: "sans-serif", fontSize: 13, fontWeight: "bold", textDecoration: "none" }}>Get Started →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg,#0d1a2b,#1a3a5c 60%,#0d1a2b)", color: "#fff", padding: "96px 48px 88px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "#7aadcf", marginBottom: 22, fontFamily: "sans-serif" }}>Open Source MBA Curriculum</p>
          <h1 style={{ fontSize: 50, fontWeight: "normal", lineHeight: 1.2, margin: "0 0 26px" }}>
            Master Business Fundamentals<br />
            <span style={{ color: "#f0c040" }}>Through Open Source Case Study</span>
          </h1>
          <p style={{ fontSize: 17, color: "#a8c4dc", lineHeight: 1.8, margin: "0 auto 44px", fontFamily: "sans-serif", maxWidth: 640 }}>
            A community-driven, intensive curriculum built around real business cases and daily practice. Open source, transparent, and built in public — study on your own terms and help shape the curriculum for everyone.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" style={{ padding: "15px 44px", background: "#c0392b", color: "#fff", borderRadius: 6, fontSize: 16, fontFamily: "sans-serif", fontWeight: "bold", textDecoration: "none" }}>Start Learning →</Link>
            <Link href="/sign-in" style={{ padding: "15px 28px", background: "transparent", color: "#a8c4dc", border: "1px solid #2a5080", borderRadius: 6, fontSize: 15, fontFamily: "sans-serif", textDecoration: "none" }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div style={{ background: "#1a3a5c", padding: "26px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {[{ n: "13", l: "Subjects" }, { n: "200+", l: "Sessions" }, { n: "50+", l: "Cases" }, { n: "90 min", l: "Per Day" }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: "#f0c040", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 11, color: "#7aadcf", marginTop: 4, fontFamily: "sans-serif", letterSpacing: 0.8, textTransform: "uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: "80px 48px", background: "#f7f4ef" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#c0392b", marginBottom: 10, fontFamily: "sans-serif" }}>What&apos;s Inside</p>
            <h2 style={{ fontSize: 30, fontWeight: "normal", margin: "0 0 10px" }}>A complete curriculum, open to everyone</h2>
            <p style={{ color: "#666", fontFamily: "sans-serif", fontSize: 15, margin: 0 }}>Built for learners who want real analytical depth — and contributors who want to make it better.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 22 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "24px 22px", border: "1px solid #e8e0d5" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ margin: "0 0 7px", fontSize: 16, fontWeight: "normal", color: "#1a3a5c" }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#666", fontFamily: "sans-serif", lineHeight: 1.75 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section style={{ padding: "72px 48px", background: "#fff" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#1a3a5c", marginBottom: 10, fontFamily: "sans-serif" }}>The Curriculum</p>
            <h2 style={{ fontSize: 28, fontWeight: "normal", margin: "0 0 8px" }}>13 modules. Two tracks. Fully open.</h2>
            <p style={{ color: "#888", fontFamily: "sans-serif", fontSize: 14, margin: 0 }}>Progress through core disciplines before advancing to applied subjects. All content is open source.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
            {curriculum.map(track => (
              <div key={track.year}>
                <p style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: track.color, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 10 }}>{track.year}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {track.subjects.map((sub) => (
                    <div key={sub.abbr} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 6, border: `1px solid ${sub.active ? "#c0d8f0" : "#ebebeb"}`, background: sub.active ? "#f0f6ff" : "#fafafa" }}>
                      <span style={{ fontSize: 9, fontFamily: "sans-serif", color: track.color, letterSpacing: 1, fontWeight: "bold", minWidth: 40 }}>{sub.abbr}</span>
                      <span style={{ fontSize: 13, flex: 1 }}>{sub.name}</span>
                      <span style={{ fontSize: 10, color: "#bbb", fontFamily: "sans-serif" }}>{sub.weeks}w</span>
                      {sub.active && <span style={{ fontSize: 8, background: track.color, color: "#fff", borderRadius: 3, padding: "2px 6px", fontFamily: "sans-serif" }}>Active</span>}
                      {!sub.active && <span style={{ fontSize: 11, color: "#ccc" }}>🔒</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 48px", background: "linear-gradient(135deg,#1a3a5c,#0d1a2b)", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{ fontSize: 30, fontWeight: "normal", color: "#fff", margin: "0 0 14px" }}>Ready to sharpen your business skills?</h2>
          <p style={{ fontSize: 15, color: "#7aadcf", fontFamily: "sans-serif", lineHeight: 1.7, margin: "0 0 28px" }}>Open source and always free. Your progress and notes saved locally. Start Finance I today.</p>
          <Link href="/sign-up" style={{ padding: "16px 48px", background: "#c0392b", color: "#fff", borderRadius: 6, fontSize: 16, fontFamily: "sans-serif", fontWeight: "bold", textDecoration: "none" }}>Join the Community →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#080f18", padding: "22px 48px" }}>
        <p style={{ maxWidth: 1100, margin: "0 auto", fontSize: 11, color: "#3a5a70", fontFamily: "sans-serif", lineHeight: 1.7 }}>
          <strong style={{ color: "#4a7a9b" }}>Disclaimer:</strong> ApexMBA is an open source self-study platform not affiliated with Harvard University, Harvard Business School, or any other academic institution. All content is independently developed and released under the MIT license for personal and community educational use.
        </p>
      </footer>
    </div>
  );
}
