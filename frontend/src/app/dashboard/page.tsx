import Link from "next/link";

export default function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative", minHeight: "80vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>My Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.125rem" }}>Welcome back, Ali. Here is your recent activity.</p>
        </div>
        <button className="btn-primary">New Application</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {/* Upload Card styled like reference */}
        <Link href="/documents" style={{ display: "block", textDecoration: "none" }}>
          <div style={{ 
            background: "#fcfaee", 
            border: "2px dashed #d19c1f", 
            borderRadius: "16px", 
            padding: "3rem 2rem", 
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            height: "100%",
            transition: "all 0.2s ease",
            cursor: "pointer"
          }}>
            <div style={{ fontSize: "3rem", color: "#f59e0b" }}>
              📁
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>Drag & Drop your Docs file</h3>
            <button className="btn-primary" style={{ padding: "0.75rem 2rem", background: "#d19c1f", boxShadow: "none" }}>
              Browse Files
            </button>
          </div>
        </Link>

        <div className="card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-muted)" }}>Active Applications</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--amber-primary)", marginBottom: "0.5rem" }}>2</div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Applications currently under review.</p>
        </div>
      </div>

      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: "1rem" }}>Application History</h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Application</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Date</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Status</th>
              <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>College Scholarship 2026</td>
              <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)" }}>Oct 1, 2026</td>
              <td style={{ padding: "1rem 1.5rem" }}>
                <span style={{ background: "var(--amber-light)", color: "var(--amber-text)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 600 }}>In Review</span>
              </td>
              <td style={{ padding: "1rem 1.5rem" }}>
                <a href="#" style={{ color: "var(--amber-primary)", fontWeight: 500 }}>View Details</a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>Medical Assistance (Hospital)</td>
              <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)" }}>Sep 15, 2026</td>
              <td style={{ padding: "1rem 1.5rem" }}>
                <span style={{ background: "#dcfce7", color: "#166534", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 600 }}>Approved</span>
              </td>
              <td style={{ padding: "1rem 1.5rem" }}>
                <a href="#" style={{ color: "var(--amber-primary)", fontWeight: 500 }}>View Details</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Hovering Chatbot Button */}
      <Link href="/chat" style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "var(--amber-primary)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        boxShadow: "var(--shadow-lg)",
        cursor: "pointer",
        zIndex: 1000,
        transition: "transform 0.2s ease"
      }}>
        💬
      </Link>
    </div>
  );
}
