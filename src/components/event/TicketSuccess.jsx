import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { EVENT_CONTENT } from '../../eventContent';

function TicketBat({ className }) {
  return <svg className={className} viewBox="0 0 64 32" aria-hidden="true"><path d="M32 17c-4-7-10-9-16-9 1 3 1 6-1 9-3-3-8-4-15-3 5 4 9 9 15 11 6 1 12-1 17-5 5 4 11 6 17 5 6-2 10-7 15-11-7-1-12 0-15 3-2-3-2-6-1-9-6 0-12 2-16 9Z" /></svg>;
}

export default function TicketSuccess({ ticket, onStartOver }) {
  const ticketRef = useRef(null);
  const [qrSrc, setQrSrc] = useState('');
  const [downloading, setDownloading] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const verifyUrl = ticket.verifyUrl || `${window.location.origin}/verify/${ticket.ticketId}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, { errorCorrectionLevel: 'H', margin: 3, width: 360, color: { dark: '#090b0d', light: '#f7f4eb' } }).then(setQrSrc);
  }, [verifyUrl]);

  const download = async (format) => {
    setDownloading(format);
    setDownloadError('');
    try {
      const png = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#080a0d', skipFonts: true });
      if (format === 'png') {
        const anchor = document.createElement('a');
        anchor.href = png;
        anchor.download = `${ticket.ticketId}.png`;
        anchor.click();
      } else {
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 500], compress: true });
        pdf.addImage(png, 'PNG', 0, 0, 1200, 500, undefined, 'FAST');
        pdf.save(`${ticket.ticketId}.pdf`);
      }
    } catch {
      setDownloadError('Your ticket could not be saved just now. Please try again.');
    } finally { setDownloading(''); }
  };

  return <section className="event-ticket-success" aria-labelledby="ticket-success-title">
    <div className="event-ticket-success__intro"><p className="event-kicker">Registration confirmed</p><h2 id="ticket-success-title">Keep this close.<br />It gets you in.</h2><p>Save your ticket now. Show its QR code at the entrance.</p></div>
    <div className="event-ticket-stage"><article className="event-ticket" ref={ticketRef} aria-label={`Entry ticket ${ticket.ticketId}`}>
      <div className="event-ticket__scene" aria-hidden="true"><span className="event-ticket__moon" /><TicketBat className="event-ticket__bat event-ticket__bat--a" /><TicketBat className="event-ticket__bat event-ticket__bat--b" /><span className="event-ticket__web" /></div>
      <div className="event-ticket__main"><div className="event-ticket__brand"><img src="/assets/vulcan-logo.png" alt="" /><span>vulcan club</span></div><p className="event-ticket__label">Halloween Hackathon</p><h3>{EVENT_CONTENT.name}</h3><dl className="event-ticket__facts"><div><dt>Date & time</dt><dd>31 October, 7:00 PM</dd></div><div><dt>Duration</dt><dd>12 hours</dd></div><div><dt>Venue</dt><dd>{EVENT_CONTENT.venue}</dd></div></dl><div className="event-ticket__team"><span>Team</span><strong>{ticket.teamName}</strong><p>{ticket.members.map((member) => `${member.position === 1 ? 'Leader: ' : ''}${member.fullName}`).join(' · ')}</p></div></div>
      <div className="event-ticket__stub"><span className="event-ticket__admit">Admit team of 3</span>{qrSrc ? <img src={qrSrc} alt={`QR code for ticket ${ticket.ticketId}`} /> : <div className="event-ticket__qr-loading">Preparing QR</div>}<strong>{ticket.ticketId}</strong><small>Scan at entry</small></div>
    </article></div>
    <div className="event-ticket-success__actions"><button className="event-register-button" onClick={() => download('png')} disabled={Boolean(downloading) || !qrSrc}>{downloading === 'png' ? 'Making PNG…' : 'Download PNG'}</button><button className="event-secondary-button" onClick={() => download('pdf')} disabled={Boolean(downloading) || !qrSrc}>{downloading === 'pdf' ? 'Making PDF…' : 'Download PDF'}</button><button className="event-text-button" onClick={onStartOver}>Register another team</button></div>
    {downloadError && <p className="event-form-notice" role="alert">{downloadError}</p>}
  </section>;
}
