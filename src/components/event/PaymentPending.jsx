import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function PaymentPending({ payment, onTicketIssued, onStartOver }) {
  const [qrSrc, setQrSrc] = useState('');
  const [reference, setReference] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const checkTicket = async () => {
    setNotice(''); setSubmitting(true);
    try {
      const response = await fetch('/api/payment-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ registrationId: payment.registrationId, paymentToken: payment.paymentToken }) });
      const result = await response.json();
      if (!response.ok) { setNotice(result.error || 'We could not check your payment status.'); return; }
      if (result.ticket) { onTicketIssued(result.ticket); return; }
      if (result.status === 'REJECTED') { setNotice('Your payment was not approved. Please contact the event organiser with your payment confirmation.'); return; }
      setNotice('Payment is still awaiting organiser approval. Please check again shortly.');
    } catch { setNotice('We could not reach the ticket service. Please try again.'); }
    finally { setSubmitting(false); }
  };

  useEffect(() => {
    QRCode.toDataURL(payment.upiUri, { errorCorrectionLevel: 'H', margin: 3, width: 360, color: { dark: '#090b0d', light: '#f7f4eb' } }).then(setQrSrc);
  }, [payment.upiUri]);

  const submitReference = async (event) => {
    event.preventDefault();
    setNotice('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/payment-reference', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: payment.registrationId, paymentToken: payment.paymentToken, paymentReference: reference }),
      });
      const result = await response.json();
      if (!response.ok) { setNotice(result.error || 'We could not submit that payment reference. Please try again.'); return; }
      setSubmitted(true);
      setNotice(result.message);
    } catch { setNotice('We could not reach the payment check securely. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return <section className="event-payment" aria-labelledby="payment-title">
    <div className="event-payment__copy"><p className="event-kicker">One last step</p><h2 id="payment-title">Pay ₹{payment.amount}<br />for your team.</h2><p>Use any UPI app to pay Vulcan Club. Then enter the transaction reference from your payment confirmation.</p><p className="event-payment__team">Team: <strong>{payment.teamName}</strong></p></div>
    <div className="event-payment__panel">
      {!submitted && <><a className="event-payment__qr" href={payment.upiUri} aria-label="Open ₹300 UPI payment"><span>{qrSrc ? <img src={qrSrc} alt="UPI payment QR code for ₹300" /> : 'Preparing payment QR…'}</span></a><p className="event-payment__amount">₹{payment.amount} · UPI</p><a className="event-secondary-button" href={payment.upiUri}>Open payment app</a><form onSubmit={submitReference} className="event-payment__form"><label className="event-field" htmlFor="payment-reference">UPI transaction reference<input id="payment-reference" value={reference} onChange={(event) => setReference(event.target.value)} maxLength="100" autoComplete="off" required disabled={submitting} /><span>Find this in your payment app after paying.</span></label><button className="event-register-button" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit payment reference'}</button></form></>}
      {submitted && <div className="event-payment__submitted" role="status"><h3>Payment submitted.</h3><p>{notice}</p><p>Keep your payment confirmation until you receive your ticket.</p><button className="event-register-button" type="button" onClick={checkTicket} disabled={submitting}>{submitting ? 'Checking…' : 'Check ticket status'}</button></div>}
      {!submitted && notice && <p className="event-form-notice" role="alert">{notice}</p>}
    </div>
    <button className="event-text-button" onClick={onStartOver}>Register another team</button>
  </section>;
}
