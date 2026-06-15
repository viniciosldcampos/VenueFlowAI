import { Navigate }       from "react-router-dom";
import { useAuth }        from "../../hooks/useAuth";
import { useEditorStore } from "../../store/editorStore";
import { THEME }          from "../../constants/objects";

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const { darkMode } = useEditorStore();
  const t = darkMode ? THEME.dark : THEME.light;

  if (loading) {
    return (
      <div style={{
        display:"flex", height:"100vh", width:"100vw",
        alignItems:"center", justifyContent:"center",
        background:t.bg, flexDirection:"column", gap:12,
        fontFamily:"'Sora', system-ui, sans-serif",
      }}>
        <div style={{
          width:48, height:48, borderRadius:"50%",
          border:`3px solid ${t.border}`,
          borderTop:`3px solid #705EBD`,
          animation:"spin 1s linear infinite",
        }} />
        <span style={{ color:t.textMuted, fontSize:13 }}>Carregando...</span>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}