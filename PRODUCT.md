# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Prospective participants registering a three-person team for a Vulcan Club event; organisers checking tickets and managing registrations at entry.

## Product Purpose

The Vulcan Club site presents club information and will host a dedicated Halloween hackathon route. The event route lets a team register, receive a QR ticket, and be checked in by organisers.

## Positioning

This route is an event-only registration experience for a free, 12-hour Halloween hackathon hosted by Vulcan Club; it is not a club membership or intake flow.

## Operating Context

Teams register on desktop or mobile before the event. At the entrance, organisers use a phone-friendly check-in page to scan the issued QR ticket once.

## Capabilities and Constraints

- Event begins at 7:00 PM IST on 31 October 2026 and ends around 7:00 AM IST on 1 November 2026.
- Teams contain exactly three members. Registration is free and contains no payment step.
- Each member records their full name, email, Indian phone number, and college or organisation independently.
- Registrations require server-side validation, anti-spam protection, private storage, and unique team, email, and phone values.
- Tickets use an unpredictable identifier and QR verification URL; QR payloads must not contain personal data.
- Supabase stores event data; Prisma is the server-side ORM. Ticket email delivery is planned via a separately configured email service.
- Event name, venue, college, prizes, eligibility, tracks, rules, schedule, sponsors, contact details, privacy note, and registration deadline remain explicitly unresolved placeholders.

## Brand Commitments

- Preserve the Vulcan name, {V} logo asset, and gold pixel motif.
- This event is a dark, polished Halloween technology experience: near-black and cold fog, restrained pumpkin orange and sickly-green accents, with gold ember pixels.
- Use CSS or SVG-drawn atmospheric artwork only; do not use stock or copyrighted imagery.
- Clear, human language; no invented claims, sponsors, prizes, attendance figures, or membership wording.

## Evidence on Hand

- Existing Vite + React site and Vulcan logo at `assets/vulcan-logo.png` and `public/assets/vulcan-logo.png`.
- Confirmed event facts in the user brief.
- No confirmed event-specific photographs, venue, sponsor, prize, schedule, or contact information.

## Product Principles

- Never make event details sound confirmed when they are placeholders.
- Make the registration and ticket journey legible on a phone.
- Protect participant personal data by default.
- Keep decorative motion atmospheric, brief, and optional.

## Accessibility & Inclusion

- Responsive from 360px upward with semantic HTML, labelled controls, visible keyboard focus, readable contrast, and screen-reader feedback for validation.
- Respect `prefers-reduced-motion`; the event remains fully usable without animation.
