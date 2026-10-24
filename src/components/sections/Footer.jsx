import { useState } from 'react';
import { CLUB_INFO } from '../../content';
import { DrawLine } from '../ui/Reveal';

export default function Footer({ prefersReducedMotion }) {
  const [bracketHover, setBracketHover] = useState(false);

  return (
    <footer className="w-full bg-vulcan-bg py-12 px-6 select-none relative">
      {/* Top Divider */}
      <div className="max-w-6xl mx-auto mb-10">
        <DrawLine prefersReducedMotion={prefersReducedMotion} />
      </div>

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

        {/* Right: Socials, Contact & System Tag */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-5 text-center sm:text-right">
          <div className="flex items-center gap-3">
            {CLUB_INFO.contact.socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-vulcan-gold transition-colors"
              >
                {social.name}
              </a>
            ))}
          </div>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <a
            href={`mailto:${CLUB_INFO.contact.email}`}
            className="text-zinc-400 hover:text-white relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-vulcan-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left transition-colors"
          >
            {CLUB_INFO.contact.email}
          </a>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-600">no open recruitment</span>
        </div>
      </div>
    </footer>
  );
}
