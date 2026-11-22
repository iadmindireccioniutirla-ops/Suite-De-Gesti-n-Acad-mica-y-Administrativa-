import { useState } from 'react';

interface LogoProps {
  className?: string;
}

export function InstitutionalLogo({ className = 'w-12 h-12' }: LogoProps) {
  const [srcIndex, setSrcIndex] = useState(0);
  const sources = ['./logo.png', '/assets/aistudio/logo_3e09a471.png'];

  if (srcIndex >= sources.length) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-md border border-[#8B0000]/30 bg-[#8B0000] text-white shrink-0`}
        aria-label="Escudo institucional IUTIRLA"
      >
        <svg
          viewBox="0 0 40 40"
          className="w-3/4 h-3/4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 4L33 9V20C33 27.5 27.4 33.8 20 36C12.6 33.8 7 27.5 7 20V9L20 4Z"
            stroke="#FAF4E1"
            strokeWidth="2"
            fill="#6E0000"
          />
          <text
            x="20"
            y="23"
            textAnchor="middle"
            fill="#FAF4E1"
            fontSize="9"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            1943
          </text>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={sources[srcIndex]}
      alt="Escudo oficial del IUTIRLA - Labor Omnia Vincit"
      referrerPolicy="no-referrer"
      onError={() => setSrcIndex((prev) => prev + 1)}
      className={`${className} object-contain shrink-0`}
    />
  );
}

interface BannerProps {
  className?: string;
}

export function InstitutionalBanner({ className = '' }: BannerProps) {
  const [srcIndex, setSrcIndex] = useState(0);
  const sources = ['./iutirla.jpg', '/assets/aistudio/iutirla_3a6a9014.png'];

  if (srcIndex >= sources.length) {
    return (
      <div
        className={`${className} flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#8B0000] via-[#A51C24] to-[#6E0000] text-white rounded-lg`}
      >
        <div className="flex items-center gap-4">
          <InstitutionalLogo className="w-14 h-14 bg-white/95 p-1 rounded-md" />
          <div>
            <p className="text-xl font-bold tracking-tight">IUTIRLA</p>
            <p className="text-sm text-white/90">Extensión Guayana — Puerto Ordaz</p>
          </div>
        </div>
        <span className="text-xs font-medium text-[#FAF4E1] hidden sm:inline">
          Instituto Universitario de Tecnología Industrial Rodolfo Loero Arismendi
        </span>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white rounded-lg border border-slate-200 overflow-hidden`}>
      <img
        src={sources[srcIndex]}
        alt="IUTIRLA Extensión Guayana - Banner institucional"
        referrerPolicy="no-referrer"
        onError={() => setSrcIndex((prev) => prev + 1)}
        className="w-full h-24 sm:h-28 md:h-32 object-contain object-left bg-white px-4 py-2"
      />
    </div>
  );
}
