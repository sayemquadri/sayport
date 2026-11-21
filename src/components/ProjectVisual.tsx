import type { ProjectVisualMotif } from '../data/portfolio';

interface ProjectVisualProps {
  motif: ProjectVisualMotif;
  index: string;
}

export function ProjectVisual({ motif, index }: ProjectVisualProps) {
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
          <rect x="54" y="42" width="44" height="6" rx="2" fill="#4E7EFF" fillOpacity="0.65" />
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
            stroke="#4E7EFF"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <path
            d="M130 148 L164 134 L198 140 L232 126 L266 132"
            fill="none"
            stroke="#4E7EFF"
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
            stroke="#4E7EFF"
            strokeOpacity="0.45"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <circle cx="160" cy="100" r="14" fill="#111114" stroke="#F0EFEC" strokeOpacity="0.65" strokeWidth="1.2" />
          <line x1="160" y1="32" x2="160" y2="86" stroke="#27272C" strokeWidth="1" />
          <line x1="174" y1="100" x2="228" y2="100" stroke="#4E7EFF" strokeOpacity="0.5" strokeWidth="1" />
          <line x1="104" y1="140" x2="148" y2="108" stroke="#27272C" strokeWidth="1" />
          <circle cx="160" cy="32" r="4" fill="#4E7EFF" />
          <circle cx="228" cy="100" r="4" fill="#F0EFEC" fillOpacity="0.8" />
          <circle cx="104" cy="140" r="4" fill="#919198" />
        </svg>
      )}

      {motif === 'ev' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          {/* Abstract mechanical & chassis geometry — no invented specs */}
          <line x1="42" y1="138" x2="278" y2="138" stroke="#27272C" strokeWidth="1" />
          <path
            d="M72 126 L104 82 L206 82 L248 112 L248 126 Z"
            fill="#111114"
            stroke="#F0EFEC"
            strokeOpacity="0.55"
            strokeWidth="1.1"
          />
          <circle cx="106" cy="128" r="18" fill="#0B0B0D" stroke="#4E7EFF" strokeWidth="1.2" />
          <circle cx="106" cy="128" r="6" fill="none" stroke="#919198" strokeWidth="1" />
          <circle cx="216" cy="128" r="18" fill="#0B0B0D" stroke="#4E7EFF" strokeWidth="1.2" />
          <circle cx="216" cy="128" r="6" fill="none" stroke="#919198" strokeWidth="1" />
          <line x1="130" y1="104" x2="192" y2="104" stroke="#4E7EFF" strokeOpacity="0.55" strokeWidth="1" />
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
            stroke="#4E7EFF"
            strokeWidth="1.6"
          />
          <line x1="112" y1="52" x2="180" y2="52" stroke="#F0EFEC" strokeOpacity="0.5" strokeWidth="1" />
          <line x1="112" y1="68" x2="208" y2="68" stroke="#919198" strokeOpacity="0.3" strokeWidth="1" />
          <line x1="112" y1="128" x2="196" y2="128" stroke="#919198" strokeOpacity="0.3" strokeWidth="1" />
          <line x1="112" y1="142" x2="166" y2="142" stroke="#919198" strokeOpacity="0.25" strokeWidth="1" />
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
          <line x1="192" y1="90" x2="284" y2="64" stroke="#4E7EFF" strokeWidth="1.4" />
          <line x1="198" y1="98" x2="284" y2="98" stroke="#F0EFEC" strokeOpacity="0.65" strokeWidth="1.1" />
          <line x1="204" y1="108" x2="284" y2="132" stroke="#919198" strokeOpacity="0.5" strokeWidth="1" />
        </svg>
      )}

      {motif === 'saydesigns' && (
        <svg viewBox="0 0 320 200" className="relative h-full w-full p-6">
          <rect x="64" y="34" width="192" height="132" fill="#111114" stroke="#27272C" strokeWidth="1" />
          <rect x="82" y="50" width="94" height="100" fill="none" stroke="#F0EFEC" strokeOpacity="0.55" strokeWidth="1" />
          <circle cx="176" cy="100" r="50" fill="none" stroke="#4E7EFF" strokeOpacity="0.65" strokeWidth="1.2" />
          <line x1="64" y1="100" x2="256" y2="100" stroke="#27272C" strokeWidth="1" />
          <line x1="176" y1="34" x2="176" y2="166" stroke="#27272C" strokeWidth="1" />
        </svg>
      )}

      <span className="absolute right-4 bottom-3 text-[11px] font-medium tracking-[0.18em] text-[#919198]/70 tabular-nums">
        {index}
      </span>
    </div>
  );
}
