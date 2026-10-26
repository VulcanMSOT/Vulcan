import { useState } from 'react';
import { Mail, ArrowUpRight } from 'lucide-react';
import { CLUB_INFO } from '../../content';
import { DrawLine } from '../ui/Reveal';

function XIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  X: XIcon,
  LinkedIn: LinkedInIcon,
  Instagram: InstagramIcon,
};

export default function Footer({ prefersReducedMotion }) {
  const [bracketHover, setBracketHover] = useState(false);

  return (
    <footer className="w-full bg-vulcan-bg py-12 px-6 select-none relative">
      {/* Top Divider */}
      <div className="max-w-6xl mx-auto mb-10">
        <DrawLine prefersReducedMotion={prefersReducedMotion} />
      </div>

      <div className="max-w-6xl mx-auto relative flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-vulcan-textMuted">
        {/* Left: Branding & College Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-center sm:text-left">
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

          <span className="text-zinc-600">•</span>

          <span className="text-zinc-400">
            {CLUB_INFO.college}
          </span>
        </div>

        {/* Center: Interactive { } Detail */}
        <div
          onMouseEnter={() => setBracketHover(true)}
          onMouseLeave={() => setBracketHover(false)}
          className="order-first md:order-none md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center gap-1 cursor-pointer transition-transform duration-200 hover:scale-110 py-1 px-3"
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

        {/* Right: Polished Social & Contact Links */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-end gap-2 sm:gap-2.5">
          {/* Socials Group */}
          <div className="flex items-center gap-2">
            {CLUB_INFO.contact.socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.name];
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-vulcan-gold/40 text-zinc-300 hover:text-white transition-all duration-200 active:scale-[0.96] shadow-sm hover:shadow-[0_0_12px_rgba(245,166,35,0.12)] whitespace-nowrap"
                  aria-label={social.name}
                >
                  {Icon && <Icon className="w-3 h-3 text-zinc-400 group-hover:text-vulcan-gold transition-colors duration-200" />}
                  <span>{social.name}</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-vulcan-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </a>
              );
            })}
          </div>

          {/* Email Pill */}
          <a
            href={`mailto:${CLUB_INFO.contact.email}`}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-vulcan-gold/30 bg-vulcan-gold/[0.05] hover:bg-vulcan-gold/[0.14] hover:border-vulcan-gold/60 text-zinc-200 hover:text-white transition-all duration-200 active:scale-[0.96] shadow-sm hover:shadow-[0_0_16px_rgba(245,166,35,0.2)] whitespace-nowrap"
            title="Email Vulcan Club"
          >
            <Mail className="w-3.5 h-3.5 text-vulcan-gold group-hover:scale-110 transition-transform duration-200" />
            <span>{CLUB_INFO.contact.email}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
