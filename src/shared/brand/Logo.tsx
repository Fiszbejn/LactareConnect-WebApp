type LogoMarkProps = {
  size?: number;
  className?: string;
};

export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
    >
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M3 20h34M20 3c6 4.5 9 10.5 9 17s-3 12.5-9 17c-6-4.5-9-10.5-9-17s3-12.5 9-17z"
        stroke="currentColor"
        strokeWidth="1.3"
        opacity="0.45"
      />
      <defs>
        <linearGradient id="lactare-drop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fc8ee" />
          <stop offset="100%" stopColor="#54b2e3" />
        </linearGradient>
      </defs>
      <path
        d="M20 11.5c3.8 4.3 6 7.7 6 10.7a6 6 0 1 1-12 0c0-3 2.2-6.4 6-10.7z"
        fill="url(#lactare-drop)"
      />
      <circle cx="17.8" cy="19.5" r="1.4" fill="white" opacity="0.85" />
    </svg>
  );
}

type LogoProps = {
  size?: number;
  dark?: boolean;
  className?: string;
};

export function Logo({ size = 26, dark = false, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark size={size} className={dark ? 'text-white' : 'text-brand'} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-sans font-extrabold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}
          style={{ fontSize: size * 0.9 }}
        >
          Lactare
          <span className={dark ? 'text-brand-light' : 'text-brand'}>.</span>
        </span>
        <span
          className={`mt-1 font-sans font-semibold uppercase tracking-[3px] ${
            dark ? 'text-white/70' : 'text-brand'
          }`}
          style={{ fontSize: size * 0.32 }}
        >
          Connect
        </span>
      </span>
    </span>
  );
}
