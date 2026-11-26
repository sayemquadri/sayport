import { useId } from 'react';

interface SayLogoProps {
  className?: string;
  surface?: 'dark' | 'light';
  ariaLabel?: string;
}

/**
 * Faithful geometric vector rendition of the SAY orbital wordmark:
 * - Stylized geometric S, A (with centered 4-point star negative space), and Y
 * - Tilted purple gradient orbital swoop intersecting cleanly without distortion
 */
export function SayLogo({
  className = 'h-7 w-auto',
  surface = 'dark',
  ariaLabel = 'SAY logo',
}: SayLogoProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `say-orbit-grad-${uid}`;
  const maskId = `say-orbit-mask-${uid}`;
  const letterFill = surface === 'dark' ? '#F0EFEC' : '#101012';

  return (
    <svg
      viewBox="0 0 400 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="54"
          y1="170"
          x2="360"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3B0FA6" />
          <stop offset="46%" stopColor="#6D28D9" />
          <stop offset="78%" stopColor="#934CFF" />
          <stop offset="100%" stopColor="#BA85FF" />
        </linearGradient>

        {/* Clean over/under weave where the orbital loop passes behind S, A, and Y's upper-left arm */}
        <mask id={maskId}>
          <rect width="400" height="184" fill="white" />
          {/* Clear behind S */}
          <path
            d="M48 64 H128 L108 136 H22 Z"
            fill="black"
          />
          {/* Clear behind A */}
          <path
            d="M174 62 H202 L254 138 H122 Z"
            fill="black"
          />
          {/* Clear behind Y upper-left arm where ring passes behind */}
          <path
            d="M238 62 H272 L308 106 L284 116 Z"
            fill="black"
          />
        </mask>
      </defs>

      {/* Tilted purple elliptical orbital swoop */}
      <g mask={`url(#${maskId})`}>
        <path
          d="M64 150 C 30 132, 64 90, 162 46 C 260 2, 344 -6, 366 18 C 384 37, 346 82, 248 126 C 150 170, 86 164, 64 150 Z
             M82 142 C 102 149, 160 142, 242 106 C 324 70, 354 34, 345 22 C 332 9, 254 19, 172 56 C 90 92, 64 130, 82 142 Z"
          fill={`url(#${gradId})`}
          fillRule="evenodd"
        />
      </g>

      {/* Geometric Letterform: S */}
      <path
        d="M52 64 H128 L115 79 H54 C48.5 79, 45 82.2, 45 86.5 C45 90.8, 48.5 94, 54 94 H103 C117 94, 126 102.5, 126 114.5 C126 127, 116 136, 101 136 H22 L35 121 H98 C104 121, 108 118, 108 113.5 C108 109, 104 106, 98 106 H50 C35.5 106, 27 97.5, 27 85.5 C27 73.2, 37 64, 52 64 Z"
        fill={letterFill}
      />

      {/* Geometric Letterform: A with centered 4-point celestial star */}
      <path
        d="M176 64 H200 L252 136 H226 L188 81 L150 136 H124 Z"
        fill={letterFill}
      />
      <path
        d="M188 101 C189.4 109.5, 192.5 112.6, 201 114 C192.5 115.4, 189.4 118.5, 188 127 C186.6 118.5, 183.5 115.4, 175 114 C183.5 112.6, 186.6 109.5, 188 101 Z"
        fill={letterFill}
      />

      {/* Geometric Letterform: Y */}
      <path
        d="M242 64 H268 L306 106 L344 64 H370 L294 136 H268 L292 113 Z"
        fill={letterFill}
      />

      {/* Foreground lower-right orbital ribbon passing across Y's lower stem */}
      <path
        d="M244 114 C 178 144, 112 162, 78 153 C 68 150, 62 145, 59 138 C 64 148, 78 154, 102 153 C 142 151, 198 133, 252 108 C 288 92, 316 74, 336 58 C 314 78, 282 97, 244 114 Z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}
