import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem", marginTop: "4rem", alignItems: "center", textAlign: "center" }}>
      <section style={{ maxWidth: "800px" }}>
        <h1 style={{ fontSize: "3.5rem", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
          One profile.<br />
          <span style={{ color: "var(--amber-primary)" }}>Every Jamaat service.</span>
        </h1>
        <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", marginBottom: "2.5rem" }}>
          Wasila is an AI-powered web application for the community. Sign in once, ask for help in plain language, and get guided to the right service.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/login" className="btn-primary" style={{ fontSize: "1.125rem", padding: "1rem 2rem" }}>
            Get Started
          </Link>
          <Link href="/chat" className="btn-secondary" style={{ fontSize: "1.125rem", padding: "1rem 2rem" }}>
            Try Chatbot
          </Link>
        </div>
      </section>

      <section className="card" style={{ width: "100%", maxWidth: "1000px", padding: "3rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", textAlign: "left" }}>
        <div>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--amber-light)", color: "var(--amber-text)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontSize: "1.5rem", fontWeight: 700 }}>
            1
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>AI-Powered Helpdesk</h3>
          <p style={{ color: "var(--text-muted)" }}>A chatbot answers questions from verified Jamaat documents and points you to the source.</p>
        </div>
        <div>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--amber-light)", color: "var(--amber-text)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontSize: "1.5rem", fontWeight: 700 }}>
            2
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Process Automation</h3>
          <p style={{ color: "var(--text-muted)" }}>We collect only missing details and create a ready-to-review application automatically.</p>
        </div>
        <div>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--amber-light)", color: "var(--amber-text)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontSize: "1.5rem", fontWeight: 700 }}>
            3
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Secure & Private</h3>
          <p style={{ color: "var(--text-muted)" }}>OneID sign-in, role-based access, and masked ID numbers ensure your data is always safe.</p>
        </div>
      </section>
    </div>
  );
}
