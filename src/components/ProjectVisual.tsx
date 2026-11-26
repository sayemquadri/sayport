import type { ProjectVisualMotif } from '../data/portfolio';

interface ProjectVisualProps {
  motif: ProjectVisualMotif;
  index: string;
  conceptualLabel?: string;
}

export function ProjectVisual({
  motif,
  index,
  conceptualLabel = 'Conceptual Preview',
}: ProjectVisualProps) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0D0D10]"
      aria-hidden="true"
    >
      {/* Subtle architectural grid backdrop */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(to right, #1D1D22 1px, transparent 1px), linear-gradient(to bottom, #1D1D22 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {motif === 'say-orbit' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <ellipse
            cx="160"
            cy="100"
            rx="116"
            ry="38"
            transform="rotate(-24 160 100)"
            fill="none"
            stroke="#8B4DFF"
            strokeWidth="1.6"
            strokeOpacity="0.85"
          />
          <ellipse
            cx="160"
            cy="100"
            rx="78"
            ry="58"
            transform="rotate(14 160 100)"
            fill="none"
            stroke="#27272C"
            strokeDasharray="4 5"
            strokeWidth="1"
          />
          <text
            x="160"
            y="109"
            textAnchor="middle"
            fill="#F0EFEC"
            fontSize="30"
            fontWeight="700"
            letterSpacing="8"
          >
            SAY
          </text>
          <circle cx="258" cy="54" r="3.5" fill="#C4A7FF" />
          <circle cx="62" cy="146" r="3" fill="#7C3AED" />
        </svg>
      )}

      {motif === 'derote' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <rect
            x="38"
            y="28"
            width="244"
            height="144"
            rx="6"
            fill="#111114"
            stroke="#27272C"
            strokeWidth="1"
          />
          <line x1="38" y1="62" x2="282" y2="62" stroke="#27272C" strokeWidth="1" />
          <line x1="112" y1="62" x2="112" y2="172" stroke="#27272C" strokeWidth="1" />
          <rect x="54" y="42" width="44" height="6" rx="2" fill="#8B4DFF" fillOpacity="0.7" />
          <rect x="54" y="80" width="42" height="4" rx="2" fill="#919198" fillOpacity="0.4" />
          <rect x="54" y="94" width="34" height="4" rx="2" fill="#919198" fillOpacity="0.25" />
          <rect x="54" y="108" width="40" height="4" rx="2" fill="#919198" fillOpacity="0.25" />
          <rect
            x="130"
            y="80"
            width="64"
            height="36"
            rx="4"
            fill="#0B0B0D"
            stroke="#27272C"
            strokeWidth="1"
          />
          <rect
            x="204"
            y="80"
            width="62"
            height="36"
            rx="4"
            fill="#0B0B0D"
            stroke="#9D6BFF"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <path
            d="M130 148 L164 134 L198 140 L232 126 L266 132"
            fill="none"
            stroke="#9D6BFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {motif === 'campus' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <circle cx="160" cy="100" r="68" fill="none" stroke="#27272C" strokeWidth="1" />
          <circle
            cx="160"
            cy="100"
            r="44"
            fill="none"
            stroke="#8B4DFF"
            strokeOpacity="0.5"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <circle cx="160" cy="100" r="14" fill="#111114" stroke="#F0EFEC" strokeOpacity="0.65" strokeWidth="1.2" />
          <line x1="160" y1="32" x2="160" y2="86" stroke="#27272C" strokeWidth="1" />
          <line x1="174" y1="100" x2="228" y2="100" stroke="#9D6BFF" strokeOpacity="0.55" strokeWidth="1" />
          <line x1="104" y1="140" x2="148" y2="108" stroke="#27272C" strokeWidth="1" />
          <circle cx="160" cy="32" r="4" fill="#9D6BFF" />
          <circle cx="228" cy="100" r="4" fill="#F0EFEC" fillOpacity="0.8" />
          <circle cx="104" cy="140" r="4" fill="#919198" />
        </svg>
      )}

      {motif === 'ev' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <line x1="42" y1="138" x2="278" y2="138" stroke="#27272C" strokeWidth="1" />
          <path
            d="M72 126 L104 82 L206 82 L248 112 L248 126 Z"
            fill="#111114"
            stroke="#F0EFEC"
            strokeOpacity="0.55"
            strokeWidth="1.1"
          />
          <circle cx="106" cy="128" r="18" fill="#0B0B0D" stroke="#9D6BFF" strokeWidth="1.2" />
          <circle cx="106" cy="128" r="6" fill="none" stroke="#919198" strokeWidth="1" />
          <circle cx="216" cy="128" r="18" fill="#0B0B0D" stroke="#9D6BFF" strokeWidth="1.2" />
          <circle cx="216" cy="128" r="6" fill="none" stroke="#919198" strokeWidth="1" />
          <line x1="130" y1="104" x2="192" y2="104" stroke="#8B4DFF" strokeOpacity="0.65" strokeWidth="1.2" />
          <line x1="160" y1="54" x2="160" y2="152" stroke="#27272C" strokeDasharray="3 3" strokeWidth="1" />
        </svg>
      )}

      {motif === 'green-string' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <rect
            x="92"
            y="26"
            width="136"
            height="148"
            rx="2"
            fill="#111114"
            stroke="#27272C"
            strokeWidth="1"
          />
          <path
            d="M74 148 C 122 146, 134 52, 162 86 C 188 116, 206 44, 246 58"
            fill="none"
            stroke="#9D6BFF"
            strokeWidth="1.6"
          />
          <line x1="112" y1="52" x2="180" y2="52" stroke="#F0EFEC" strokeOpacity="0.5" strokeWidth="1" />
          <line x1="112" y1="68" x2="208" y2="68" stroke="#919198" strokeOpacity="0.3" strokeWidth="1" />
          <line x1="112" y1="128" x2="196" y2="128" stroke="#919198" strokeOpacity="0.3" strokeWidth="1" />
          <line x1="112" y1="142" x2="166" y2="142" stroke="#919198" strokeOpacity="0.25" strokeWidth="1" />
        </svg>
      )}

      {motif === 'voice-reel' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          {[48, 66, 84, 102, 120, 138, 156, 174, 192, 210, 228, 246, 264].map((x, idx) => {
            const heights = [22, 40, 68, 48, 92, 54, 108, 64, 86, 44, 62, 32, 20];
            const h = heights[idx] ?? 30;
            const y = 100 - h / 2;
            const isPeak = idx === 4 || idx === 6 || idx === 8;
            return (
              <rect
                key={x}
                x={x}
                y={y}
                width="6"
                height={h}
                rx="3"
                fill={isPeak ? '#9D6BFF' : '#32323A'}
                fillOpacity={isPeak ? 0.9 : 0.8}
              />
            );
          })}
        </svg>
      )}

      {motif === 'aq-explains' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <polygon
            points="160,38 228,152 92,152"
            fill="#111114"
            stroke="#F0EFEC"
            strokeOpacity="0.6"
            strokeWidth="1.2"
          />
          <line x1="36" y1="110" x2="128" y2="96" stroke="#919198" strokeWidth="1.2" />
          <line x1="192" y1="90" x2="284" y2="64" stroke="#9D6BFF" strokeWidth="1.5" />
          <line x1="198" y1="98" x2="284" y2="98" stroke="#F0EFEC" strokeOpacity="0.65" strokeWidth="1.1" />
          <line x1="204" y1="108" x2="284" y2="132" stroke="#919198" strokeOpacity="0.5" strokeWidth="1" />
        </svg>
      )}

      {motif === 'ai-proto' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <rect x="64" y="42" width="192" height="116" rx="8" fill="#111114" stroke="#27272C" strokeWidth="1" />
          <circle cx="114" cy="100" r="24" fill="none" stroke="#8B4DFF" strokeWidth="1.3" />
          <circle cx="114" cy="100" r="6" fill="#C4A7FF" />
          <line x1="152" y1="80" x2="230" y2="80" stroke="#F0EFEC" strokeOpacity="0.55" strokeWidth="1.4" />
          <line x1="152" y1="100" x2="216" y2="100" stroke="#9D6BFF" strokeOpacity="0.65" strokeWidth="1.4" />
          <line x1="152" y1="120" x2="224" y2="120" stroke="#919198" strokeOpacity="0.4" strokeWidth="1.2" />
        </svg>
      )}

      {motif === 'constellation' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <path
            d="M70 132 L118 68 L174 96 L224 54 L256 122 L174 148 Z"
            fill="none"
            stroke="#9D6BFF"
            strokeOpacity="0.65"
            strokeWidth="1.1"
          />
          <line x1="118" y1="68" x2="174" y2="148" stroke="#27272C" strokeWidth="1" />
          {[
            [70, 132],
            [118, 68],
            [174, 96],
            [224, 54],
            [256, 122],
            [174, 148],
          ].map(([cx, cy], i) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={i % 2 === 0 ? 3.5 : 2.5}
              fill={i % 2 === 0 ? '#C4A7FF' : '#F0EFEC'}
            />
          ))}
        </svg>
      )}

      <span className="absolute bottom-3 left-4 text-[10px] tracking-[0.14em] text-[#919198]/70">
        {conceptualLabel}
      </span>

      <span className="absolute right-4 bottom-3 text-[11px] font-medium tracking-[0.18em] text-[#919198]/70 tabular-nums">
        {index}
      </span>
    </div>
  );
}
