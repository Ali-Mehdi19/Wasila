"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, [pathname]);

  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  const handleSignOut = () => {
    localStorage.removeItem("role");
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href={role === "admin" ? "/admin" : "/dashboard"} className="nav-logo">
          <span className="nav-logo-icon">●</span> Wasila
        </Link>
        <div className="nav-links">
          {role !== "admin" && (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/documents" className="nav-link">Documents</Link>
            </>
          )}
          <Link href="/login" onClick={handleSignOut} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            Sign Out
          </Link>
        </div>
      </div>
    </nav>
  );
}
