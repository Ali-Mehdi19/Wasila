export default function Chatbot() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <header>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Wasila Helpdesk</h1>
        <p style={{ color: "var(--text-muted)" }}>Type or talk. Answers come only from the Jamaat's verified documents, with the source shown.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", minHeight: "65vh" }}>
        {/* Left side: Avatar / Video UI */}
        <div style={{ display: "flex", flexDirection: "column", background: "#181a1b", borderRadius: "16px", color: "white", padding: "1rem" }}>
          <div style={{ position: "relative", flex: 1, background: "#000", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
            {/* Badge */}
            <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(0,0,0,0.6)", padding: "0.35rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", zIndex: 10 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s infinite" }}></div>
              Speaking
            </div>
            {/* Avatar Image with talking animation */}
            <style>{`
              @keyframes subtle-talk {
                0%, 100% { transform: scale(1) translateY(0); }
                25% { transform: scale(1.01) translateY(-1px); }
                75% { transform: scale(1.005) translateY(1px); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
            <img src="/avatar.jpg" alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9, animation: "subtle-talk 2.5s infinite ease-in-out" }} />
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button style={{ background: "#2a2a2a", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 500 }}>Mute mic</button>
            <button style={{ background: "#2a2a2a", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 500 }}>End</button>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#888" }}>Your browser will ask for microphone access. A spoken session lasts up to 5 minutes.</p>
        </div>

        {/* Right side: Chat UI */}
        <div style={{ display: "flex", flexDirection: "column", background: "#181a1b", borderRadius: "16px", color: "white", padding: "2rem", gap: "1rem", justifyContent: "space-between" }}>
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Salaam! How can I help?</h2>
            <p style={{ color: "#a1a1aa", textAlign: "center", fontSize: "0.875rem", marginBottom: "1rem" }}>Ask about documents, forms, eligibility or which office handles a service.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "80%" }}>
              <button style={{ background: "transparent", border: "1px solid #3f3f46", color: "white", padding: "0.75rem 1rem", borderRadius: "9999px", textAlign: "center", transition: "all 0.2s", cursor: "pointer", fontSize: "0.875rem" }}>What documents do I need for medical assistance?</button>
              <button style={{ background: "transparent", border: "1px solid #3f3f46", color: "white", padding: "0.75rem 1rem", borderRadius: "9999px", textAlign: "center", transition: "all 0.2s", cursor: "pointer", fontSize: "0.875rem" }}>How do I apply for a college scholarship?</button>
              <button style={{ background: "transparent", border: "1px solid #3f3f46", color: "white", padding: "0.75rem 1rem", borderRadius: "9999px", textAlign: "center", transition: "all 0.2s", cursor: "pointer", fontSize: "0.875rem" }}>What are the Jamaat office timings?</button>
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <form style={{ display: "flex", gap: "1rem" }}>
              <input 
                type="text" 
                placeholder="Type your question... (please don't share Aadhaar, PAN or...)" 
                style={{ flex: 1, padding: "1rem 1.25rem", borderRadius: "9999px", background: "transparent", border: "1px solid #3f3f46", color: "white", outline: "none", fontSize: "0.875rem" }} 
              />
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
