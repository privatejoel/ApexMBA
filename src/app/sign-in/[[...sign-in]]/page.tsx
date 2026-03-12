import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0d1a2b,#1a3a5c 60%,#0d1a2b)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#1a3a5c,#c0392b)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>▲</div>
          <span style={{ color: "#fff", fontSize: 22, fontFamily: "Georgia, serif" }}>ApexMBA</span>
        </div>
        <p style={{ color: "#7aadcf", fontFamily: "sans-serif", fontSize: 14, margin: 0 }}>Sign in to continue your MBA journey</p>
      </div>
      <SignIn />
    </div>
  );
}
