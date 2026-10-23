import { useState } from 'react';
import { CLUB_INFO } from '../../content';

export default function Footer() {
  const [bracketHover, setBracketHover] = useState(false);

  return (
    <footer className="w-full bg-vulcan-bg border-t border-vulcan-border/60 py-12 px-6 select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs font-mono text-vulcan-textMuted">
        {/* Left: Branding & College Name */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/vulcan-logo.png"
              alt="Vulcan emblem"
              className="w-5 h-5 object-contain opacity-80"
            />
            <span className="font-sans font-bold text-sm text-white lowercase">
              {CLUB_INFO.name}
            </span>
          </div>

          <span className="hidden sm:inline text-zinc-600">•</span>

          <span className="text-zinc-400">
            {CLUB_INFO.college}
          </span>
        </div>

        {/* Center: Interactive { } Detail */}
        <div
          onMouseEnter={() => setBracketHover(true)}
          onMouseLeave={() => setBracketHover(false)}
          className="flex items-center gap-1 cursor-pointer transition-transform duration-200 hover:scale-110"
          title="build with precision"
          aria-label="Vulcan syntax bracket"
        >
          <span
            className={`transition-transform duration-200 text-sm font-bold ${
              bracketHover ? '-translate-x-1 text-vulcan-gold' : 'text-zinc-500'
            }`}
          >
            &#123;
          </span>
          <span className="w-1.5 h-1.5 bg-vulcan-gold shadow-[0_0_6px_#F5A623] inline-block mx-0.5" />
          <span
            className={`transition-transform duration-200 text-sm font-bold ${
              bracketHover ? 'translate-x-1 text-vulcan-gold' : 'text-zinc-500'
            }`}
          >
            &#125;
          </span>
        </div>

        {/* Right: Contact & System Tag */}
        <div className="flex items-center gap-5 text-center sm:text-right">
          <span>{CLUB_INFO.contact.email}</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-600">no open recruitment</span>
        </div>
      </div>
    </footer>
  );
}
