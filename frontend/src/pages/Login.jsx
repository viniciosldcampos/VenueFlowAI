import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

export default function Login() {
  const { login }          = useAuth();
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t                  = darkMode ? THEME.dark : THEME.light;
  const navigate           = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display:         "flex",
      height:          "100vh",
      width:           "100vw",
      background:      t.bg,
      alignItems:      "center",
      justifyContent:  "center",
      fontFamily:      "'Sora', system-ui, sans-serif",
      position:        "fixed",
      top: 0, left: 0,
    }}>
      <div style={{
        width:        420,
        background:   t.surface,
        borderRadius: 16,
        padding:      "40px",
        border:       `1px solid ${t.border}`,
        boxShadow:    "0 24px 80px rgba(0,0,0,0.3)",
      }}>
        {/* logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:          64, height: 64,
            borderRadius:   16, margin: "0 auto 12px",
            background:     "linear-gradient(135deg, #705EBD, #A78BFA)",
            display:        "flex", alignItems: "center", justifyContent: "center",
            fontSize:       28, fontWeight: 900, color: "#fff",
          }}>V</div>
          <div style={{ fontSize:22, fontWeight:800, color:t.text }}>VenueFlow</div>
          <div style={{ fontSize:13, color:t.textMuted, marginTop:4 }}>
            Faça login para continuar
          </div>
        </div>

        {/* erro */}
        {error && (
          <div style={{
            background:   "#EF444422",
            border:       "1px solid #EF444444",
            borderRadius: 8,
            padding:      "10px 14px",
            fontSize:     13,
            color:        "#EF4444",
            marginBottom: 16,
          }}>{error}</div>
        )}

        {/* formulário */}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, color:t.textMuted, fontWeight:600, display:"block", marginBottom:5 }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width:"100%", padding:"11px 14px", borderRadius:8,
                border:`1px solid ${t.border}`, background:t.bg,
                color:t.text, fontSize:13, fontFamily:"inherit",
                outline:"none", boxSizing:"border-box",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize:12, color:t.textMuted, fontWeight:600, display:"block", marginBottom:5 }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width:"100%", padding:"11px 14px", borderRadius:8,
                border:`1px solid ${t.border}`, background:t.bg,
                color:t.text, fontSize:13, fontFamily:"inherit",
                outline:"none", boxSizing:"border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width:"100%", padding:"12px", borderRadius:8, border:"none",
              background:   loading ? t.border : "linear-gradient(135deg, #705EBD, #A78BFA)",
              color:        "#fff", fontWeight:700, fontSize:14,
              cursor:       loading ? "default" : "pointer",
              fontFamily:   "inherit", marginTop:4,
              transition:   "opacity 0.2s",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* toggle dark mode */}
        <div style={{ textAlign:"center", marginTop:20 }}>
          <button
            onClick={toggleDarkMode}
            style={{
              background:"none", border:"none", color:t.textMuted,
              cursor:"pointer", fontSize:12, fontFamily:"inherit",
            }}
          >
            {darkMode ? "☀ Modo Claro" : "🌙 Modo Escuro"}
          </button>
        </div>
      </div>
    </div>
  );
}