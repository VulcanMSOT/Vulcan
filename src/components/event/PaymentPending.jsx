import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../../lib/supabaseClient';
import { apiFetch } from '../../lib/api';

function CopyBadge({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!value) return;
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="event-payment__meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <strong className="event-payment__order-ref" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          {value || '—'}
        </strong>
        <button
          type="button"
          onClick={copy}
          style={{
            background: 'rgba(255,122,26,0.15)',
            border: '1px solid rgba(255,122,26,0.35)',
            color: '#ff9a4d',
            borderRadius: '6px',
            fontSize: '11px',
            padding: '3px 8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          aria-label={`Copy ${label}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function PaymentPending({ payment, onTicketIssued, onStartOver }) {
  const [currentPayment, setCurrentPayment] = useState(payment);
  const [view, setView] = useState(() => {
    if (payment?.status === 'lookup') return 'lookup';
    if (payment?.status === 'PENDING_REVIEW') return 'under_review';
    if (payment?.status === 'REJECTED') return 'rejected';
    return 'pay';
  });

  const [qrSrc, setQrSrc] = useState('');
  const [utr, setUtr] = useState(payment?.utr || '');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Lookup state
  const [lookupId, setLookupId] = useState(payment?.teamId || payment?.orderRef || '');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupBusy, setLookupBusy] = useState(false);

  const fileInputRef = useRef(null);

  const teamId = currentPayment?.teamId || currentPayment?.orderRef || 'VHK-PENDING';
  const paymentRef = currentPayment?.paymentRef || 'PAY-PENDING';
  const amount = currentPayment?.amount || 300;
  const upiId = currentPayment?.vpa || import.meta.env.VITE_UPI_ID || import.meta.env.NEXT_PUBLIC_UPI_ID || 'himangshuyadav2@oksbi';
  const upiUri = `upi://pay?pa=${upiId}&pn=Vulcan&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentRef)}`;

  // Generate QR code client-side
  useEffect(() => {
    QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: { dark: '#080a0d', light: '#f7f4eb' },
    })
      .then(setQrSrc)
      .catch(console.error);
  }, [upiUri]);

  // Handle screenshot file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Screenshot must be 2MB or smaller.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Upload a JPEG, PNG, or WebP image.');
      return;
    }

    setError('');
    setScreenshotFile(file);
    const url = URL.createObjectURL(file);
    setScreenshotPreview(url);
  };

  // Upload screenshot to Supabase private storage
  const uploadScreenshot = async (file) => {
    if (!file || !supabase) return null;
    const ext = file.name.split('.').pop() || 'png';
    const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${teamId}-${Date.now()}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(path, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.warn('Screenshot upload warning:', uploadError);
      return null;
    }
    return path;
  };

  // Submit UTR and optional screenshot
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const cleanUtr = utr.trim().replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanUtr)) {
      setError('Please enter a valid 12-digit UPI transaction reference (UTR).');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedPath = null;
      if (screenshotFile) {
        try {
          uploadedPath = await uploadScreenshot(screenshotFile);
        } catch (uploadErr) {
          console.warn('Could not upload screenshot, proceeding with UTR:', uploadErr);
        }
      }

      const result = await apiFetch('/api/payment-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: currentPayment.registrationId,
          paymentToken: currentPayment.paymentToken,
          utr: cleanUtr,
          screenshotPath: uploadedPath,
        }),
      });

      setCurrentPayment((prev) => ({
        ...prev,
        utr: cleanUtr,
        status: 'PENDING_REVIEW',
      }));
      setView('under_review');
      setNotice(result.message || 'Payment submitted for organiser review.');
    } catch (err) {
      setError(err.message || 'We could not submit that payment reference.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check ticket status
  const checkStatus = async () => {
    setError('');
    setChecking(true);
    try {
      const result = await apiFetch('/api/payment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: currentPayment?.registrationId,
          paymentToken: currentPayment?.paymentToken,
          teamId,
          paymentRef,
        }),
      });

      if (result.ticket) {
        onTicketIssued(result.ticket);
        return;
      }

      if (result.status === 'REJECTED') {
        setCurrentPayment((prev) => ({
          ...prev,
          status: 'REJECTED',
          rejectReason: result.rejectReason,
        }));
        setView('rejected');
        setError(result.rejectReason ? `Payment rejected: ${result.rejectReason}` : 'Your payment reference was not approved.');
        return;
      }

      if (result.status === 'PENDING_REVIEW') {
        setNotice('Payment is still awaiting organiser manual verification. Please check back shortly.');
      } else {
        setNotice('Payment not yet submitted.');
      }
    } catch (err) {
      setError(err.message || 'Could not verify status.');
    } finally {
      setChecking(false);
    }
  };

  // Status Lookup (by teamId + registered email)
  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLookupBusy(true);

    try {
      const result = await apiFetch('/api/payment-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: lookupId.trim(),
          email: lookupEmail.trim(),
        }),
      });

      setCurrentPayment({
        registrationId: result.registrationId,
        paymentToken: result.paymentToken,
        teamId: result.teamId,
        paymentRef: result.paymentRef,
        orderRef: result.teamId,
        teamName: result.teamName,
        amount: result.amount,
        vpa: upiId,
        status: result.status,
        rejectReason: result.rejectReason,
        utr: result.utr,
      });

      if (result.status === 'PAID' && result.ticket) {
        onTicketIssued(result.ticket);
        return;
      }

      if (result.status === 'REJECTED') {
        setView('rejected');
        setError(result.rejectReason ? `Payment rejected: ${result.rejectReason}` : 'Payment was not approved.');
      } else if (result.status === 'PENDING_REVIEW') {
        setView('under_review');
        setNotice('Your payment is currently under organiser manual review.');
      } else {
        setView('pay');
      }
    } catch (err) {
      setError(err.message || 'Error checking status.');
    } finally {
      setLookupBusy(false);
    }
  };

  return (
    <section className="event-payment" aria-labelledby="payment-title">
      <div className="event-payment__copy">
        <p className="event-kicker">Halloween Hackathon</p>
        <h2 id="payment-title">
          {view === 'under_review'
            ? 'Payment under review'
            : view === 'rejected'
              ? 'Payment rejected'
              : `Complete payment of ₹${amount}`}
        </h2>

        {/* IMPORTANT NOTICE: SAVE THESE TWO IDS */}
        <div
          style={{
            background: 'rgba(255, 122, 26, 0.1)',
            border: '1px solid rgba(255, 122, 26, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            margin: '16px 0',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>📸</span>
            <strong style={{ color: '#ff9a4d', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Save these two IDs now!
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#e6ded3' }}>
            Please <strong>take a screenshot</strong> of this screen. Since there is no automated email, your{' '}
            <strong>Team ID</strong> and <strong>Payment Reference</strong> are your proof of registration and are required to check your status.
          </p>
        </div>

        <div className="event-payment__meta-card">
          <CopyBadge label="Team ID" value={teamId} />
          <CopyBadge label="Payment Reference" value={paymentRef} />
          <div className="event-payment__meta-row">
            <span>Team name</span>
            <strong>{currentPayment?.teamName || 'Your team'}</strong>
          </div>
          <div className="event-payment__meta-row">
            <span>Amount</span>
            <strong>₹{amount} (Team of 3)</strong>
          </div>
        </div>

        <div className="event-payment__tabs">
          <button
            type="button"
            className={`event-payment__tab-btn ${view !== 'lookup' ? 'is-active' : ''}`}
            onClick={() => { setView('pay'); setError(''); setNotice(''); }}
          >
            Payment details
          </button>
          <button
            type="button"
            className={`event-payment__tab-btn ${view === 'lookup' ? 'is-active' : ''}`}
            onClick={() => { setView('lookup'); setError(''); setNotice(''); }}
          >
            Find existing registration
          </button>
        </div>
      </div>

      <div className="event-payment__panel">
        {error && <p className="event-form-notice event-form-notice--error" role="alert">{error}</p>}
        {notice && <p className="event-form-notice" role="status">{notice}</p>}

        {/* View 1: PAY / RESUBMIT SCREEN */}
        {(view === 'pay' || view === 'rejected') && (
          <div className="event-payment__pay-flow">
            {view === 'rejected' && currentPayment?.rejectReason && (
              <div className="event-payment__reject-banner" role="alert">
                <strong>Organiser reason for rejection:</strong> {currentPayment.rejectReason}
              </div>
            )}

            <div className="event-payment__qr-wrap">
              <a className="event-payment__qr" href={upiUri} aria-label={`Pay ₹${amount} via UPI`}>
                <span>
                  {qrSrc ? <img src={qrSrc} alt={`UPI payment QR for ₹${amount}`} /> : 'Preparing payment QR…'}
                </span>
              </a>
              <div className="event-payment__qr-details">
                <p className="event-payment__amount">₹{amount} · UPI</p>
                <p className="event-payment__vpa">
                  UPI ID: <code>{upiId}</code>
                </p>
                <p style={{ fontSize: '12px', color: '#a39e93', margin: '4px 0 10px' }}>
                  Note: <code>{paymentRef}</code>
                </p>
                <a className="event-secondary-button" href={upiUri}>
                  Pay with UPI app <span>↗</span>
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="event-payment__form">
              <label className="event-field" htmlFor="utr-input">
                12-digit UPI / UTR Transaction ID
                <input
                  id="utr-input"
                  name="utr"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{12}"
                  maxLength={12}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 428910482910"
                  autoComplete="off"
                  required
                  disabled={submitting}
                />
                <span className="event-field-hint">
                  Must be exactly 12 numeric digits from your UPI payment confirmation.
                </span>
              </label>

              <label className="event-field" htmlFor="screenshot-input">
                Payment screenshot (optional, max 2MB)
                <input
                  ref={fileInputRef}
                  id="screenshot-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
                <span className="event-field-hint">
                  Upload screenshot proof to verify payment faster.
                </span>
              </label>

              {screenshotPreview && (
                <div className="event-payment__preview-box">
                  <img src={screenshotPreview} alt="Payment screenshot preview" />
                  <button
                    type="button"
                    className="event-payment__preview-remove"
                    onClick={() => {
                      setScreenshotFile(null);
                      setScreenshotPreview('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove screenshot
                  </button>
                </div>
              )}

              <button
                className="event-register-button"
                type="submit"
                disabled={submitting || utr.trim().length !== 12}
              >
                {submitting ? 'Submitting payment…' : 'Submit for review'} <span aria-hidden="true">↘</span>
              </button>
            </form>
          </div>
        )}

        {/* View 2: UNDER REVIEW SCREEN */}
        {view === 'under_review' && (
          <div className="event-payment__submitted" role="status">
            <div className="event-payment__submitted-icon" aria-hidden="true">⏳</div>
            <h3>Payment under review</h3>
            <p>
              Your payment of <strong>₹{amount}</strong> with reference <code>{currentPayment?.utr || utr}</code> has been submitted for manual organiser review.
            </p>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                margin: '16px 0',
                textAlign: 'left',
              }}
            >
              <p style={{ margin: '0 0 6px', fontSize: '13px' }}><strong>Team ID:</strong> <code>{teamId}</code></p>
              <p style={{ margin: 0, fontSize: '13px' }}><strong>Payment Ref:</strong> <code>{paymentRef}</code></p>
            </div>
            <p className="event-payment__submitted-sub">
              Organisers manually verify transfers against bank account statements. Once approved, your tickets will be available immediately on this status page.
            </p>

            <div className="event-payment__submitted-actions">
              <button
                className="event-register-button"
                type="button"
                onClick={checkStatus}
                disabled={checking}
              >
                {checking ? 'Checking status…' : 'Check ticket status now'}
              </button>
              <button
                className="event-secondary-button"
                type="button"
                onClick={() => setView('pay')}
              >
                Update payment reference
              </button>
            </div>
          </div>
        )}

        {/* View 3: LOOKUP REGISTRATION SCREEN */}
        {view === 'lookup' && (
          <form onSubmit={handleLookup} className="event-payment__form">
            <h3>Find your registration & ticket</h3>
            <p className="event-field-hint">
              Enter your Team ID (e.g. VHK-1001) or Payment Ref, plus your team leader’s registered email to download your ticket or check verification status.
            </p>

            <label className="event-field" htmlFor="lookup-id">
              Team ID or Payment Reference
              <input
                id="lookup-id"
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value.toUpperCase())}
                placeholder="e.g. VHK-1001 or PAY-XXXXXX"
                autoCapitalize="characters"
                required
                disabled={lookupBusy}
              />
            </label>

            <label className="event-field" htmlFor="lookup-email">
              Team leader registered email
              <input
                id="lookup-email"
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="leader@college.edu"
                required
                disabled={lookupBusy}
              />
            </label>

            <button
              className="event-register-button"
              type="submit"
              disabled={lookupBusy}
            >
              {lookupBusy ? 'Looking up…' : 'Lookup registration & ticket'} <span aria-hidden="true">↘</span>
            </button>
          </form>
        )}
      </div>

      <div className="event-payment__footer">
        <button className="event-text-button" onClick={onStartOver}>
          Register another team
        </button>
      </div>
    </section>
  );
}
