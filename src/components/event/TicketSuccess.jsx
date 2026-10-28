import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { EVENT_CONTENT } from '../../eventContent';

function TicketBat({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 32" aria-hidden="true">
      <path d="M32 17c-4-7-10-9-16-9 1 3 1 6-1 9-3-3-8-4-15-3 5 4 9 9 15 11 6 1 12-1 17-5 5 4 11 6 17 5 6-2 10-7 15-11-7-1-12 0-15 3-2-3-2-6-1-9-6 0-12 2-16 9Z" />
    </svg>
  );
}

function ReferralCodeItem({ memberName, code }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vulcan-hackathon.vercel.app';
  const shareUrl = `${origin}/halloween-hack?ref=${code}`;

  const copyCode = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="event-referral-card">
      <div className="event-referral-card__header">
        <span className="event-referral-card__name">{memberName}</span>
        <span className="event-referral-card__tag">Mirai Referral</span>
      </div>
      <div className="event-referral-card__body">
        <div className="event-referral-card__row">
          <span className="event-referral-card__label">Referral code</span>
          <div className="event-referral-card__action-group">
            <code className="event-referral-card__code">{code}</code>
            <button
              type="button"
              className={`event-referral-card__btn ${copiedCode ? 'event-referral-card__btn--copied' : ''}`}
              onClick={copyCode}
              aria-label={`Copy referral code for ${memberName}`}
            >
              {copiedCode ? 'Copied code' : 'Copy code'}
            </button>
          </div>
        </div>
        <div className="event-referral-card__row">
          <span className="event-referral-card__label">Share link</span>
          <div className="event-referral-card__action-group">
            <span className="event-referral-card__url">{shareUrl}</span>
            <button
              type="button"
              className={`event-referral-card__btn ${copiedLink ? 'event-referral-card__btn--copied' : ''}`}
              onClick={copyLink}
              aria-label={`Copy referral link for ${memberName}`}
            >
              {copiedLink ? 'Copied link' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketSuccess({ ticket, onStartOver, referralCodes: propReferralCodes, referralRewardText: propRewardText }) {
  const codes = propReferralCodes || ticket?.referralCodes || [];
  const rewardText = propRewardText || ticket?.referralRewardText || '';
  const ticketRef = useRef(null);
  const stageRef = useRef(null);
  const [qrSrc, setQrSrc] = useState('');
  const [downloading, setDownloading] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const teamId = ticket.teamId || ticket.orderRef || ticket.ticketId || 'VHK-1001';
  const paymentRef = ticket.paymentRef || 'PAY-CONFIRMED';
  // QR encodes team_id + token as required by Section 4
  const qrPayload = ticket.verifyPayload || `${teamId}:${ticket.ticketToken || ticket.ticketId || 'VALID'}`;

  useEffect(() => {
    QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 3,
      width: 360,
      color: { dark: '#090b0d', light: '#f7f4eb' },
    })
      .then(setQrSrc)
      .catch(console.error);
  }, [qrPayload]);

  const handlePointerMove = (e) => {
    if (!stageRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;
    setTilt({
      rx: -normY * 8,
      ry: normX * 8,
      mx: Math.round((x / rect.width) * 100),
      my: Math.round((y / rect.height) * 100),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
  };

  const download = async (format) => {
    setDownloading(format);
    setDownloadError('');
    try {
      const png = await toPng(ticketRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#080a0d',
        skipFonts: true,
      });
      if (format === 'png') {
        const anchor = document.createElement('a');
        anchor.href = png;
        anchor.download = `ticket-${teamId}.png`;
        anchor.click();
      } else {
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 500], compress: true });
        pdf.addImage(png, 'PNG', 0, 0, 1200, 500, undefined, 'FAST');
        pdf.save(`ticket-${teamId}.pdf`);
      }
    } catch {
      setDownloadError('Your ticket could not be saved just now. Please try again.');
    } finally {
      setDownloading('');
    }
  };

  return (
    <section className="event-ticket-success" aria-labelledby="ticket-success-title">
      <div className="event-ticket-success__intro">
        <p className="event-kicker">Payment confirmed · Official ticket issued</p>
        <h2 id="ticket-success-title">
          Keep this close.<br />It gets your team in.
        </h2>
        <p>
          Download your official entry ticket PDF now. Show this QR code at the entrance check-in desk.
        </p>
      </div>

      <div
        className="event-ticket-stage"
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="event-ticket-burst" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={`event-ticket-burst__ember event-ticket-burst__ember--${i + 1}`} />
          ))}
        </div>

        <article
          className="event-ticket"
          ref={ticketRef}
          aria-label={`Entry ticket ${teamId}`}
          style={{
            transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            '--mouse-x': `${tilt.mx}%`,
            '--mouse-y': `${tilt.my}%`,
          }}
        >
          <div className="event-ticket__glow-highlight" aria-hidden="true" />
          <div className="event-ticket__scene" aria-hidden="true">
            <span className="event-ticket__moon" />
            <TicketBat className="event-ticket__bat event-ticket__bat--a" />
            <TicketBat className="event-ticket__bat event-ticket__bat--b" />
            <span className="event-ticket__web" />
          </div>
          <div className="event-ticket__main">
            <div className="event-ticket__brand">
              <img src="/assets/vulcan-logo.png" alt="" />
              <span>vulcan club</span>
            </div>
            <p className="event-ticket__label">{EVENT_CONTENT.label}</p>
            <h3>{EVENT_CONTENT.name}</h3>
            <dl className="event-ticket__facts">
              <div><dt>Date & time</dt><dd>{EVENT_CONTENT.dateLabel}</dd></div>
              <div><dt>Team ID</dt><dd style={{ color: '#ff9a4d', fontFamily: 'monospace', fontWeight: 700 }}>{teamId}</dd></div>
              <div><dt>Payment Ref</dt><dd style={{ fontFamily: 'monospace' }}>{paymentRef}</dd></div>
              <div><dt>Venue</dt><dd>{EVENT_CONTENT.venue}</dd></div>
            </dl>
            <div className="event-ticket__team">
              <span>Team</span>
              <strong>{ticket.teamName}</strong>
              <p>
                {ticket.members
                  ? ticket.members.map((m) => `${m.position === 1 ? 'Leader: ' : ''}${m.fullName}`).join(' · ')
                  : '3 Team Members'}
              </p>
            </div>
          </div>
          <div className="event-ticket__stub">
            <span className="event-ticket__admit">Admit team of 3</span>
            {qrSrc ? <img src={qrSrc} alt={`QR code for ticket ${teamId}`} /> : <div className="event-ticket__qr-loading">Preparing QR</div>}
            <strong>{teamId}</strong>
            <small>Scan at entrance desk</small>
          </div>
        </article>
      </div>

      <div className="event-ticket-success__actions">
        <button
          className="event-register-button"
          onClick={() => download('pdf')}
          disabled={Boolean(downloading) || !qrSrc}
        >
          {downloading === 'pdf' ? 'Generating PDF…' : 'Download ticket (PDF)'}
        </button>
        <button
          className="event-secondary-button"
          onClick={() => download('png')}
          disabled={Boolean(downloading) || !qrSrc}
        >
          {downloading === 'png' ? 'Making PNG…' : 'Download PNG'}
        </button>
        <button className="event-text-button" onClick={onStartOver}>
          Register another team
        </button>
      </div>
      {downloadError && <p className="event-form-notice" role="alert">{downloadError}</p>}

      {codes.length > 0 && (
        <section className="event-referral-section" aria-labelledby="referral-section-heading">
          <div className="event-referral-section__header">
            <h3 id="referral-section-heading">Your referral codes</h3>
            <p>
              Share your code or link with other teams registering for Hack-O-Lantern.
            </p>
          </div>
          {rewardText ? (
            <div className="event-referral-reward-box">
              <p>{rewardText}</p>
            </div>
          ) : null}
          <div className="event-referral-list">
            {codes.map((item) => (
              <ReferralCodeItem key={item.code} memberName={item.name} code={item.code} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
