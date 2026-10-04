export default function Documents() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Documents Updates</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.125rem" }}>Manage verified Jamaat procedures and forms.</p>
        </div>
      </header>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <input type="text" className="input-field" placeholder="Search procedures, forms..." style={{ flex: 1 }} />
          <button className="btn-secondary">Filter</button>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem", background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--amber-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-text)" }}>
                📄
              </div>
              <div>
                <h3 style={{ fontWeight: 600 }}>Hospital Admission Procedure v2.pdf</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Medical Committee • Updated 2 days ago</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>View</button>
              <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", color: "#dc2626", borderColor: "#fca5a5" }}>Delete</button>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--amber-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-text)" }}>
                📄
              </div>
              <div>
                <h3 style={{ fontWeight: 600 }}>Scholarship Requirements 2026.docx</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Education Committee • Updated 1 week ago</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>View</button>
              <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", color: "#dc2626", borderColor: "#fca5a5" }}>Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="card" style={{ background: "var(--amber-light)", border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--amber-text)", marginBottom: "0.25rem" }}>Vector DB Sync Status</h3>
            <p style={{ color: "var(--amber-text)", opacity: 0.8 }}>All 128 documents are currently indexed and searchable by the chatbot.</p>
          </div>
          <button className="btn-primary" style={{ background: "var(--amber-text)", color: "var(--amber-light)" }}>Force Re-Index</button>
        </div>
      </div> */}
    </div>
  );
}
