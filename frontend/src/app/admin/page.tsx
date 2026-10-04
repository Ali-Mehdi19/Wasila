export default function AdminDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Admin Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.125rem" }}>Committee overview and pending reviews.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-secondary">Export Data</button>
          <button className="btn-primary">Manage Users</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        <div className="card" style={{ borderLeft: "4px solid var(--amber-primary)", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-muted)" }}>Pending Reviews</h3>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>12</div>
          <p style={{ fontSize: "0.75rem", color: "var(--amber-primary)", fontWeight: 500, marginTop: "0.25rem" }}>+3 since yesterday</p>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-muted)" }}>Approved This Month</h3>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>45</div>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-muted)" }}>Total Cost</h3>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>$23,000</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Recent Applications</h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Applicant ID</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Type</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Cost</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Status</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontFamily: "monospace" }}>#W-8472</td>
                  <td style={{ padding: "1rem 1.5rem" }}>Education Scholarship</td>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>$8,000</td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ background: "var(--amber-light)", color: "var(--amber-text)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 600 }}>Needs Review</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Review</button>
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem", fontFamily: "monospace" }}>#W-8471</td>
                  <td style={{ padding: "1rem 1.5rem" }}>Medical Assistance</td>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>$15,000</td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ background: "var(--amber-light)", color: "var(--amber-text)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 600 }}>Needs Review</span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Review</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>User Uploaded Documents</h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>File Name</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Uploaded By</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Date</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text-muted)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>📊</span>
                      <span style={{ fontWeight: 500 }}>Q3_Financial_Report.xlsx</span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>Ali Reza</td>
                  <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)" }}>Oct 4, 2026</td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Download</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
