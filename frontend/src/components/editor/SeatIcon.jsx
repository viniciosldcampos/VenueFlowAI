import { SEAT_TYPES } from "../../constants/objects";

export default function SeatIcon({
  type = "standard",
  size = 22,
  selected = false,
  status = "available",
}) {
  const cfg = SEAT_TYPES[type] || SEAT_TYPES.standard;

  const statusColors = {
    available: cfg.color,
    occupied:  "#374151",
    selected:  "#705EBD",
    blocked:   "#6B7280",
    reserved:  "#F59E0B",
  };

  const col = statusColors[status] || cfg.color;
  const s = size;

  // ── PCD: ícone de cadeirante ───────────
  if (type === "pcd") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect
          x="2" y="2" width="20" height="20" rx="4"
          fill={col} opacity="0.15"
          stroke={col} strokeWidth="1.5"
        />
        <text
          x="12" y="17"
          textAnchor="middle"
          fontSize="13"
          fill={col}
        >
          ♿
        </text>
        {selected && (
          <rect
            x="1" y="1" width="22" height="22" rx="5"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="3,2"
          />
        )}
      </svg>
    );
  }

  // ── CÃO-GUIA ───────────
  if (type === "guidedog") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect
          x="2" y="2" width="20" height="20" rx="4"
          fill={col} opacity="0.15"
          stroke={col} strokeWidth="1.5"
        />
        <text
          x="12" y="17"
          textAnchor="middle"
          fontSize="13"
          fill={col}
        >
          🐕
        </text>
        {selected && (
          <rect
            x="1" y="1" width="22" height="22" rx="5"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="3,2"
          />
        )}
      </svg>
    );
  }

  // ── PUFF ───────────
  if (type === "puff") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        {/* corpo arredondado */}
        <ellipse cx="12" cy="13" rx="8" ry="6" fill={col} opacity="0.9" />
        <ellipse cx="12" cy="11" rx="7" ry="5" fill={col} />
        {/* highlight */}
        <ellipse cx="10" cy="9" rx="3" ry="2" fill="#fff" opacity="0.2" />
        {selected && (
          <rect
            x="1" y="1" width="22" height="22" rx="5"
            fill="none" stroke="#fff"
            strokeWidth="2" strokeDasharray="3,2"
          />
        )}
      </svg>
    );
  }

  // ── BANQUETA ───────────
  if (type === "banqueta") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        {/* assento */}
        <rect x="4" y="8" width="16" height="5" rx="2" fill={col} />
        {/* pernas */}
        <rect x="6"  y="13" width="2" height="6" rx="1" fill={col} opacity="0.7" />
        <rect x="16" y="13" width="2" height="6" rx="1" fill={col} opacity="0.7" />
        <rect x="11" y="13" width="2" height="6" rx="1" fill={col} opacity="0.7" />
        {/* highlight */}
        <rect x="6" y="9" width="5" height="2" rx="1" fill="#fff" opacity="0.2" />
        {selected && (
          <rect
            x="1" y="1" width="22" height="22" rx="5"
            fill="none" stroke="#fff"
            strokeWidth="2" strokeDasharray="3,2"
          />
        )}
      </svg>
    );
  }

  // ── POLTRONA PADRÃO (standard, vip, premium, dbox) ───────────
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {/* sombra */}
      <ellipse cx="12" cy="22" rx="7" ry="1.5" fill="#000" opacity="0.15" />

      {/* base do assento */}
      <rect x="4" y="14" width="16" height="5" rx="2" fill={col} opacity="0.85" />

      {/* encosto */}
      <rect x="4" y="5" width="16" height="10" rx="3" fill={col} />

      {/* apoios de braço */}
      <rect x="2"  y="9" width="4" height="7" rx="2" fill={col} opacity="0.7" />
      <rect x="18" y="9" width="4" height="7" rx="2" fill={col} opacity="0.7" />

      {/* highlight no encosto */}
      <rect x="7" y="7" width="6" height="5" rx="2" fill="#fff" opacity="0.15" />

      {/* ícone VIP */}
      {type === "vip" && (
        <text x="12" y="13" textAnchor="middle" fontSize="6" fill="#FFD700">
          ★
        </text>
      )}

      {/* ícone Premium */}
      {type === "premium" && (
        <text x="12" y="13" textAnchor="middle" fontSize="6" fill="#fff" opacity="0.9">
          ✦
        </text>
      )}

      {/* ícone D-BOX */}
      {type === "dbox" && (
        <text x="12" y="13" textAnchor="middle" fontSize="5" fill="#fff" opacity="0.9">
          D
        </text>
      )}

      {/* borda de seleção */}
      {selected && (
        <rect
          x="1" y="1" width="22" height="22" rx="5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
      )}

      {/* indicador de status ocupado */}
      {status === "occupied" && (
        <circle cx="19" cy="5" r="3" fill="#EF4444" />
      )}

      {/* indicador de status reservado */}
      {status === "reserved" && (
        <circle cx="19" cy="5" r="3" fill="#F59E0B" />
      )}

      {/* indicador de bloqueado */}
      {status === "blocked" && (
        <line
          x1="6" y1="6" x2="18" y2="18"
          stroke="#6B7280" strokeWidth="2" strokeLinecap="round"
        />
      )}
    </svg>
  );
}