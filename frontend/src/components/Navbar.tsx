import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-icon">●</span> Wasila
        </Link>
        <div className="nav-links">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/documents" className="nav-link">Documents</Link>
          <Link href="/chat" className="nav-link">Chat Helpdesk</Link>
          <Link href="/admin" className="nav-link">Admin</Link>
          <Link href="/login" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
