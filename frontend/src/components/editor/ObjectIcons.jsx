// ─── SVGs ESTILO BLUEPRINT ────────────────────────────────────────────────────
// Cada componente recebe width e height e renderiza o SVG preenchendo 100%

export function WallIcon({ color = "#cc6312" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradiente dos tijolos */}
        <linearGradient id="brickGradient" x1="0%" y1="10%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`${color}CC`} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>

        {/* Sombra suave */}
        <filter id="shadow" x="20%" y="-20%" width="80%" height="100%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1"
            floodOpacity="0.15"
          />
        </filter>
      </defs>

      {/* Fundo */}
      <rect
        width="100"
        height="100"
        rx="8"
        fill={`${color}10`}
      />

      {/* Tijolos */}
      {[0, 1, 2, 3, 4, 5,6].map((row) => (
        <g
          key={row}
          transform={`translate(${row % 2 === 0 ? 0 : -12.5}, ${
            row * 14
          })`}
        >
          {[0, 25, 50, 75, 100].map((x) => (
            <rect
              key={x}
              x={x}
              y={3}
              width="40"
              height="20"
              rx="2"
              fill="url(#brickGradient)"
              stroke={`${color}AA`}
              strokeWidth="0.8"
              filter="url(#shadow)"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function StageIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 160 80"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moldura */}
      <rect
        x="2"
        y="2"
        width="156"
        height="76"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Barra superior */}
      <line
        x1="25"
        y1="8"
        x2="135"
        y2="8"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Cortina esquerda */}
      <path
        d="M15 5
           C20 20,20 60,15 75"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      <path
        d="M10 5
           C15 20,15 60,10 75"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      <path
        d="M5 5
           C10 20,10 60,5 75"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Cortina direita */}
      <path
        d="M145 5
           C140 20,140 60,145 75"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      <path
        d="M150 5
           C145 20,145 60,150 75"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      <path
        d="M155 5
           C150 20,150 60,155 75"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Holofotes */}
      {[40, 80, 120].map((x) => (
        <g key={x}>
          <circle
            cx={x}
            cy={8}
            r="3.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
        </g>
      ))}

      {/* Feixes */}
      <line
        x1="40"
        y1="12"
        x2="55"
        y2="45"
        stroke={color}
        strokeWidth="1"
      />

      <line
        x1="40"
        y1="12"
        x2="45"
        y2="45"
        stroke={color}
        strokeWidth="1"
      />

      <line
        x1="80"
        y1="12"
        x2="72"
        y2="50"
        stroke={color}
        strokeWidth="1"
      />

      <line
        x1="80"
        y1="12"
        x2="88"
        y2="50"
        stroke={color}
        strokeWidth="1"
      />

      <line
        x1="120"
        y1="12"
        x2="105"
        y2="45"
        stroke={color}
        strokeWidth="1"
      />

      <line
        x1="120"
        y1="12"
        x2="115"
        y2="45"
        stroke={color}
        strokeWidth="1"
      />

      {/* Fundo do palco */}
      <line
        x1="25"
        y1="52"
        x2="135"
        y2="52"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="4,3"
      />

      <line
        x1="25"
        y1="60"
        x2="135"
        y2="60"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="4,3"
      />

      {/* Piso em perspectiva */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line
          key={i}
          x1={20 + i * 18}
          y1="78"
          x2={35 + i * 12}
          y2="64"
          stroke={color}
          strokeWidth="1"
        />
      ))}

      {/* Linha frontal do palco */}
      <line
        x1="20"
        y1="64"
        x2="140"
        y2="64"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ScreenIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 120 60"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moldura externa */}
      <rect
        x="1"
        y="1"
        width="118"
        height="58"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Suporte superior */}
      <line
        x1="15"
        y1="8"
        x2="105"
        y2="8"
        stroke={color}
        strokeWidth="2"
      />

      {/* Tela principal */}
      <rect
        x="8"
        y="10"
        width="104"
        height="42"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      />

      {/* Linhas de projeção */}
      <line
        x1="20"
        y1="22"
        x2="100"
        y2="22"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />

      <line
        x1="20"
        y1="31"
        x2="100"
        y2="31"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />

      <line
        x1="20"
        y1="40"
        x2="100"
        y2="40"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Cabo central */}
      <line
        x1="60"
        y1="8"
        x2="60"
        y2="10"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Base inferior */}
      <line
        x1="20"
        y1="54"
        x2="100"
        y2="54"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

export function TVIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 80 60"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moldura externa */}
      <rect
        x="1"
        y="1"
        width="78"
        height="58"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Corpo da TV */}
      <rect
        x="4"
        y="4"
        width="72"
        height="46"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />

      {/* Tela ocupando quase toda a TV */}
      <rect
        x="8"
        y="8"
        width="64"
        height="38"
        rx="2"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="1"
      />

      {/* Reflexo moderno */}
      <line
        x1="14"
        y1="14"
        x2="30"
        y2="30"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Suporte */}
      <line
        x1="40"
        y1="50"
        x2="40"
        y2="55"
        stroke={color}
        strokeWidth="2"
      />

      {/* Base */}
      <line
        x1="28"
        y1="55"
        x2="52"
        y2="55"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

export function LEDIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 120 40"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moldura externa */}
      <rect
        x="1"
        y="1"
        width="118"
        height="38"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Painel LED ocupando quase toda a área */}
      <rect
        x="4"
        y="4"
        width="112"
        height="32"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />

      {/* Matriz de LEDs */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 14 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={10 + col * 7.5}
            cy={10 + row * 6}
            r="1.2"
            fill="#FFFFFF"
            opacity="0.8"
          />
        ))
      )}

      {/* Suportes superiores */}
      <line
        x1="20"
        y1="1"
        x2="20"
        y2="4"
        stroke={color}
        strokeWidth="2"
      />

      <line
        x1="100"
        y1="1"
        x2="100"
        y2="4"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

export function DoorIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 40 80"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moldura externa */}
      <rect
        x="1"
        y="1"
        width="38"
        height="78"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Porta ocupando quase toda a área */}
      <rect
        x="4"
        y="3"
        width="32"
        height="74"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />

      {/* Painel superior */}
      <rect
        x="8"
        y="10"
        width="24"
        height="24"
        rx="1"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />

      {/* Painel inferior */}
      <rect
        x="8"
        y="44"
        width="24"
        height="24"
        rx="1"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />

      {/* Maçaneta */}
      <circle
        cx="29"
        cy="40"
        r="1.8"
        fill={color}
      />

      {/* Arco de abertura */}
      <path
        d="M4 76 Q4 4 36 4"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="3,2"
        opacity="0.6"
      />
    </svg>
  );
}

export function StairsIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 60 80"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moldura */}
      <rect
        x="1"
        y="1"
        width="58"
        height="78"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Escada ocupando quase toda a área */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={4 + i * 8}
          y={68 - i * 11}
          width={50 - i * 8}
          height="10"
          rx="1"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      ))}

      {/* Corrimão */}
      <line
        x1="6"
        y1="10"
        x2="54"
        y2="10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      <line
        x1="6"
        y1="10"
        x2="6"
        y2="72"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Seta de direção */}
      <line
        x1="30"
        y1="68"
        x2="30"
        y2="52"
        stroke={color}
        strokeWidth="2"
      />

      <path
        d="M24 58 L30 52 L36 58"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ColumnIcon({ color = "#44403C" }) {
  return (
    <svg viewBox="0 0 40 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="80" fill={`${color}22`} />
      {/* base */}
      <rect x="3" y="68" width="34" height="10" rx="1" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
      {/* fuste */}
      <rect x="10" y="14" width="20" height="54" fill={`${color}22`} stroke={color} strokeWidth="1.5"/>
      {/* linhas do fuste */}
      <line x1="15" y1="14" x2="15" y2="68" stroke={color} strokeWidth="0.8" opacity="0.5"/>
      <line x1="20" y1="14" x2="20" y2="68" stroke={color} strokeWidth="0.8" opacity="0.5"/>
      <line x1="25" y1="14" x2="25" y2="68" stroke={color} strokeWidth="0.8" opacity="0.5"/>
      {/* capitel */}
      <rect x="4" y="8" width="32" height="8" rx="1" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
      <rect x="2" y="4" width="36" height="6" rx="1" fill={`${color}44`} stroke={color} strokeWidth="2"/>
      <rect x="0.5" y="0.5" width="39" height="79" fill="none" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

export function CorridorIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 40 100"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moldura */}
      <rect
        x="1"
        y="1"
        width="38"
        height="98"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Parede esquerda */}
      <line
        x1="8"
        y1="4"
        x2="8"
        y2="96"
        stroke={color}
        strokeWidth="3"
      />

      {/* Parede direita */}
      <line
        x1="32"
        y1="4"
        x2="32"
        y2="96"
        stroke={color}
        strokeWidth="3"
      />

      {/* Marcações do piso */}
      {[15, 30, 45, 60, 75, 90].map((y) => (
        <line
          key={y}
          x1="12"
          y1={y}
          x2="28"
          y2={y}
          stroke={color}
          strokeWidth="1"
          opacity="0.4"
        />
      ))}
    </svg>
  );
}

export function WindowIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 80 50"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Moldura externa */}
      <rect
        x="1"
        y="1"
        width="78"
        height="48"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Janela ocupando quase toda a área */}
      <rect
        x="4"
        y="4"
        width="72"
        height="40"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />

      {/* Divisão vertical */}
      <line
        x1="40"
        y1="4"
        x2="40"
        y2="44"
        stroke={color}
        strokeWidth="2"
      />

      {/* Divisão horizontal */}
      <line
        x1="4"
        y1="24"
        x2="76"
        y2="24"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Reflexo esquerdo */}
      <line
        x1="12"
        y1="10"
        x2="22"
        y2="20"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Reflexo direito */}
      <line
        x1="48"
        y1="10"
        x2="58"
        y2="20"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Peitoril */}
      <line
        x1="4"
        y1="46"
        x2="76"
        y2="46"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

export function CamaroteIcon({ color = "#D97706" }) {
  return (
    <svg viewBox="0 0 100 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="80" fill={`${color}22`} />
      {/* mesa central */}
      <ellipse cx="50" cy="45" rx="22" ry="14" fill={`${color}22`} stroke={color} strokeWidth="1.5"/>
      {/* poltronas ao redor */}
      {[
        {x:20, y:30}, {x:50, y:18}, {x:80, y:30},
        {x:20, y:60}, {x:50, y:68}, {x:80, y:60},
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
          <rect x="-8" y="-7" width="16" height="14" rx="3"
            fill={`${color}33`} stroke={color} strokeWidth="1.2"/>
          <rect x="-8" y="-12" width="16" height="7" rx="2"
            fill={`${color}44`} stroke={color} strokeWidth="1"/>
        </g>
      ))}
      {/* taças */}
      <path d="M44 42 L44 38 L48 34 L52 38 L52 42 Z" fill="none" stroke={color} strokeWidth="1"/>
      <line x1="48" y1="42" x2="48" y2="46" stroke={color} strokeWidth="1"/>
      <rect x="0.5" y="0.5" width="99" height="79" fill="none" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

export function StandIcon({ color = "#059669" }) {
  return (
    <svg viewBox="0 0 80 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="60" fill={`${color}22`} />
      {/* estrutura do stand */}
      <rect x="5" y="10" width="70" height="45" fill={`${color}11`} stroke={color} strokeWidth="2" rx="2"/>
      {/* balcão frontal */}
      <rect x="5" y="38" width="70" height="17" fill={`${color}22`} stroke={color} strokeWidth="1.5"/>
      {/* painel fundo */}
      <rect x="8" y="12" width="64" height="24" fill={`${color}11`} stroke={color} strokeWidth="1"/>
      {/* pilares */}
      <rect x="5"  y="10" width="5" height="45" fill={`${color}33`} stroke={color} strokeWidth="1"/>
      <rect x="70" y="10" width="5" height="45" fill={`${color}33`} stroke={color} strokeWidth="1"/>
      {/* toldo */}
      <path d="M3 10 L77 10 L72 4 L8 4 Z" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
      {/* prateleiras */}
      <line x1="12" y1="22" x2="68" y2="22" stroke={color} strokeWidth="1" opacity="0.6"/>
      <line x1="12" y1="32" x2="68" y2="32" stroke={color} strokeWidth="1" opacity="0.6"/>
      <rect x="0.5" y="0.5" width="79" height="59" fill="none" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

export function CheckinIcon({ color = "#0EA5E9" }) {
  return (
    <svg viewBox="0 0 80 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="40" fill={`${color}22`} />
      {/* mesa */}
      <rect x="5" y="15" width="70" height="20" rx="2" fill={`${color}18`} stroke={color} strokeWidth="2"/>
      {/* pernas */}
      <rect x="8"  y="35" width="4" height="4" fill={`${color}33`} stroke={color} strokeWidth="1"/>
      <rect x="68" y="35" width="4" height="4" fill={`${color}33`} stroke={color} strokeWidth="1"/>
      {/* monitor */}
      <rect x="18" y="5" width="20" height="13" rx="1" fill={`${color}22`} stroke={color} strokeWidth="1.5"/>
      <line x1="26" y1="18" x2="26" y2="22" stroke={color} strokeWidth="1"/>
      {/* tablet/leitor */}
      <rect x="44" y="7" width="12" height="16" rx="1" fill={`${color}22`} stroke={color} strokeWidth="1.5"/>
      {/* check mark */}
      <path d="M47 15 L50 18 L56 12" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* pessoa */}
      <circle cx="67" cy="10" r="4" fill="none" stroke={color} strokeWidth="1.5"/>
      <path d="M62 22 Q67 17 72 22" fill="none" stroke={color} strokeWidth="1.5"/>
      <rect x="0.5" y="0.5" width="79" height="39" fill="none" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

export function BarIcon({ color = "#7C3AED" }) {
  return (
    <svg viewBox="0 0 80 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="60" fill={`${color}22`} />
      {/* balcão */}
      <rect x="4" y="28" width="72" height="28" rx="2" fill={`${color}22`} stroke={color} strokeWidth="2"/>
      {/* tampo */}
      <rect x="2" y="24" width="76" height="6" rx="2" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
      {/* prateleiras */}
      <rect x="8" y="4" width="64" height="20" fill={`${color}11`} stroke={color} strokeWidth="1.5" rx="1"/>
      <line x1="8" y1="12" x2="72" y2="12" stroke={color} strokeWidth="1" opacity="0.6"/>
      {/* garrafas */}
      {[15,25,35,45,55,65].map((x) => (
        <g key={x}>
          <rect x={x-3} y="5" width="6" height="14" rx="1"
            fill={`${color}33`} stroke={color} strokeWidth="0.8"/>
          <rect x={x-1.5} y="3" width="3" height="4" rx="1"
            fill={`${color}44`} stroke={color} strokeWidth="0.8"/>
        </g>
      ))}
      {/* taças no balcão */}
      <path d="M25 24 L25 18 L30 12 L35 18 L35 24" fill="none" stroke={color} strokeWidth="1"/>
      <path d="M50 24 L50 18 L55 12 L60 18 L60 24" fill="none" stroke={color} strokeWidth="1"/>
      <rect x="0.5" y="0.5" width="79" height="59" fill="none" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

export function LoungeIcon({ color = "#BE185D" }) {
  return (
    <svg viewBox="0 0 100 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="80" fill={`${color}22`} />
      {/* sofá */}
      <rect x="8" y="30" width="84" height="36" rx="4" fill={`${color}22`} stroke={color} strokeWidth="2"/>
      {/* encosto */}
      <rect x="8" y="20" width="84" height="14" rx="3" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
      {/* braços */}
      <rect x="4"  y="28" width="10" height="30" rx="3" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
      <rect x="86" y="28" width="10" height="30" rx="3" fill={`${color}33`} stroke={color} strokeWidth="1.5"/>
      {/* almofadas */}
      <rect x="12" y="32" width="34" height="28" rx="3" fill={`${color}18`} stroke={color} strokeWidth="1"/>
      <rect x="54" y="32" width="34" height="28" rx="3" fill={`${color}18`} stroke={color} strokeWidth="1"/>
      {/* pés */}
      <rect x="12" y="64" width="6" height="8" rx="1" fill={`${color}44`} stroke={color} strokeWidth="1"/>
      <rect x="36" y="64" width="6" height="8" rx="1" fill={`${color}44`} stroke={color} strokeWidth="1"/>
      <rect x="58" y="64" width="6" height="8" rx="1" fill={`${color}44`} stroke={color} strokeWidth="1"/>
      <rect x="82" y="64" width="6" height="8" rx="1" fill={`${color}44`} stroke={color} strokeWidth="1"/>
      {/* mesa de centro */}
      <rect x="32" y="6" width="36" height="16" rx="3" fill={`${color}11`} stroke={color} strokeWidth="1.5"/>
      <rect x="0.5" y="0.5" width="99" height="79" fill="none" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

export function RoundTableIcon({ color = "#FFFFFF" }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mesa principal */}
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />

      {/* Detalhe interno */}
      <circle
        cx="40"
        cy="40"
        r="22"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Cadeiras */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 40 + 36 * Math.sin(rad);
        const y = 40 - 36 * Math.cos(rad);

        return (
          <g
            key={i}
            transform={`translate(${x}, ${y}) rotate(${angle})`}
          >
            <rect
              x="-4"
              y="-4"
              width="8"
              height="8"
              rx="2"
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function BackdropIcon({ color = "#6D28D9" }) {
  return (
    <svg viewBox="0 0 120 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" fill={`${color}22`} />
      {/* estrutura metálica */}
      <rect x="2" y="3" width="116" height="34" fill={`${color}11`} stroke={color} strokeWidth="2" rx="1"/>
      {/* grid do painel */}
      {[20,40,60,80,100].map((x) => (
        <line key={x} x1={x} y1="3" x2={x} y2="37" stroke={color} strokeWidth="0.8" opacity="0.4"/>
      ))}
      {[12,20,28].map((y) => (
        <line key={y} x1="2" y1={y} x2="118" y2={y} stroke={color} strokeWidth="0.8" opacity="0.4"/>
      ))}
      {/* logotipo genérico */}
      <rect x="45" y="10" width="30" height="20" rx="2" fill="none" stroke={color} strokeWidth="1.5"/>
      <line x1="45" y1="20" x2="75" y2="20" stroke={color} strokeWidth="1"/>
      {/* suportes */}
      <rect x="4"  y="0" width="6" height="5" rx="1" fill={`${color}44`} stroke={color} strokeWidth="1"/>
      <rect x="55" y="0" width="6" height="5" rx="1" fill={`${color}44`} stroke={color} strokeWidth="1"/>
      <rect x="110" y="0" width="6" height="5" rx="1" fill={`${color}44`} stroke={color} strokeWidth="1"/>
      <rect x="0.5" y="0.5" width="119" height="39" fill="none" stroke={color} strokeWidth="2"/>
    </svg>
  );
}