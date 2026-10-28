import { useEffect, useMemo, useRef, useState } from 'react';
import { EVENT_CONTENT } from '../../eventContent';
import { apiFetch } from '../../lib/api.js';

const memberKeys = ['leader', 'member2', 'member3'];
const initialMember = { fullName: '', email: '', phone: '', college: '' };
const initialValues = {
  teamName: '',
  referralCode: '',
  leader: { ...initialMember },
  member2: { ...initialMember },
  member3: { ...initialMember },
  agreed: false,
  company: '',
};

const steps = ['Team', 'Leader', 'Members', 'Review'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizePhone = (phone) => phone.replace(/[\s-]/g, '').replace(/^\+91/, '');
const isIndianMobile = (phone) => /^[6-9]\d{9}$/.test(normalizePhone(phone));

function FieldError({ message, id }) {
  return message ? <p className="event-field-error" id={id} role="alert">{message}</p> : null;
}

function CollegeField({ memberKey, value, onChange, error, id }) {
  const isMirai = value === 'Mirai School of Technology';
  const isOther = Boolean(value && !isMirai);
  const [selected, setSelected] = useState(() => {
    if (isMirai) return 'Mirai School of Technology';
    if (value) return '__OTHER__';
    return '';
  });
  const [otherText, setOtherText] = useState(() => (isOther ? value : ''));

  useEffect(() => {
    if (value === 'Mirai School of Technology') {
      setSelected('Mirai School of Technology');
    } else if (value) {
      setSelected('__OTHER__');
      setOtherText(value);
    } else {
      setSelected('');
      setOtherText('');
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const choice = e.target.value;
    setSelected(choice);
    if (choice === 'Mirai School of Technology') {
      onChange({ target: { name: `${memberKey}.college`, value: 'Mirai School of Technology' } });
    } else if (choice === '__OTHER__') {
      onChange({ target: { name: `${memberKey}.college`, value: otherText } });
    } else {
      onChange({ target: { name: `${memberKey}.college`, value: '' } });
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setOtherText(text);
    onChange({ target: { name: `${memberKey}.college`, value: text } });
  };

  return (
    <div className="event-field" key="college" style={{ gridColumn: '1 / -1' }}>
      <label htmlFor={`${id}-select`}>College / organisation</label>
      <select
        id={`${id}-select`}
        value={selected}
        onChange={handleSelectChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">Select college / organisation…</option>
        <option value="Mirai School of Technology">Mirai School of Technology</option>
        <option value="__OTHER__">Other (specify below)</option>
      </select>
      {selected === '__OTHER__' && (
        <input
          id={id}
          name={`${memberKey}.college`}
          type="text"
          value={otherText}
          onChange={handleTextChange}
          placeholder="Enter college or organisation name"
          minLength="2"
          maxLength="80"
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      <FieldError message={error} id={`${id}-error`} />
    </div>
  );
}

function MemberFields({ memberKey, title, leader, values, onChange, errors }) {
  const member = values[memberKey];
  const base = `member-${memberKey}`;
  const textFields = [
    ['fullName', 'Full name', 'text', 'name'],
    ['email', 'Email address', 'email', 'email'],
    ['phone', 'Contact phone number', 'tel', 'tel'],
  ];
  return (
    <fieldset className="event-member-fields">
      <legend>{title}{leader && <span>Team leader</span>}</legend>
      <div className="event-form-grid">
        {textFields.map(([field, label, type, autocomplete]) => {
          const error = errors[`${memberKey}.${field}`];
          const id = `${base}-${field}`;
          return (
            <label className="event-field" key={field} htmlFor={id}>
              {label}
              <input
                id={id}
                name={`${memberKey}.${field}`}
                type={type}
                value={member[field]}
                onChange={onChange}
                autoComplete={autocomplete}
                inputMode={type === 'tel' ? 'tel' : undefined}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              <FieldError message={error} id={`${id}-error`} />
            </label>
          );
        })}
        <CollegeField
          memberKey={memberKey}
          value={member.college}
          onChange={onChange}
          error={errors[`${memberKey}.college`]}
          id={`${base}-college`}
        />
      </div>
    </fieldset>
  );
}

function Turnstile({ onToken, onError }) {
  const containerRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;
    let widgetId;
    const render = () => {
      if (widgetId !== undefined || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: onToken,
        'expired-callback': () => onToken(''),
        'error-callback': () => onError('The anti-spam check could not load. Please retry.'),
      });
    };
    const existing = document.querySelector('script[data-turnstile]');
    if (existing) render();
    else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = 'true';
      script.addEventListener('load', render);
      document.head.appendChild(script);
    }
    return () => { if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId); };
  }, [onError, onToken, siteKey]);

  if (!siteKey) return null;
  return <div className="event-turnstile" ref={containerRef} />;
}

export default function RegistrationForm({ onRegistered }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventSettings, setEventSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [referralStatus, setReferralStatus] = useState(null);
  const [checkingReferral, setCheckingReferral] = useState(false);

  // Read ?ref= query param and sync with sessionStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        const cleanRef = refParam.trim().toUpperCase();
        sessionStorage.setItem('vulcan_ref_code', cleanRef);
        setValues((v) => ({ ...v, referralCode: cleanRef }));
      } else {
        const stored = sessionStorage.getItem('vulcan_ref_code');
        if (stored) {
          setValues((v) => ({ ...v, referralCode: stored }));
        }
      }
    } catch {}
  }, []);

  const handleReferralBlur = async () => {
    const code = values.referralCode?.trim().toUpperCase();
    if (!code) {
      setReferralStatus(null);
      return;
    }
    setCheckingReferral(true);
    try {
      const res = await apiFetch('/api/referral-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setReferralStatus({ ok: true, message: 'Referral code applied' });
        setErrors((prev) => {
          const next = { ...prev };
          delete next.referralCode;
          return next;
        });
      } else {
        setReferralStatus({ ok: false, message: "That referral code isn't valid." });
        setErrors((prev) => ({ ...prev, referralCode: "That referral code isn't valid." }));
      }
    } catch {
      setReferralStatus({ ok: false, message: "That referral code isn't valid." });
      setErrors((prev) => ({ ...prev, referralCode: "That referral code isn't valid." }));
    } finally {
      setCheckingReferral(false);
    }
  };

  // Fetch live server event settings
  useEffect(() => {
    let active = true;
    apiFetch('/api/event-settings')
      .then((data) => {
        if (active && data) {
          setEventSettings(data);
        }
      })
      .catch((err) => console.warn('Could not load dynamic settings:', err.message))
      .finally(() => {
        if (active) setLoadingSettings(false);
      });
    return () => { active = false; };
  }, []);

  const teamMembers = useMemo(() => memberKeys.map((key) => values[key]), [values]);

  const validate = (targetStep = step) => {
    const nextErrors = {};
    if (targetStep === 0 || targetStep === 3) {
      const teamName = values.teamName.trim();
      if (teamName.length < 2 || teamName.length > 40) nextErrors.teamName = 'Use a team name between 2 and 40 characters.';
    }
    const relevantKeys = targetStep === 1 ? ['leader'] : targetStep === 2 ? ['member2', 'member3'] : targetStep === 3 ? memberKeys : [];
    relevantKeys.forEach((memberKey) => {
      const member = values[memberKey];
      if (!member.fullName.trim()) nextErrors[`${memberKey}.fullName`] = 'Enter this member’s full name.';
      if (!emailPattern.test(member.email.trim())) nextErrors[`${memberKey}.email`] = 'Enter a valid email address.';
      if (!isIndianMobile(member.phone)) nextErrors[`${memberKey}.phone`] = 'Use a 10-digit Indian mobile number. +91 is accepted.';
      const collegeLength = member.college.trim().length;
      if (collegeLength < 2 || collegeLength > 80) nextErrors[`${memberKey}.college`] = 'Enter a college or organisation between 2 and 80 characters.';
    });
    if (targetStep === 3) {
      const emails = teamMembers.map((member) => member.email.trim().toLowerCase());
      const phones = teamMembers.map((member) => normalizePhone(member.phone));
      emails.forEach((email, index) => {
        if (emails.indexOf(email) !== index) nextErrors[`${memberKeys[index]}.email`] = 'Each team member needs a different email address.';
      });
      phones.forEach((phone, index) => {
        if (phones.indexOf(phone) !== index) nextErrors[`${memberKeys[index]}.phone`] = 'Each team member needs a different phone number.';
      });
      if (!values.agreed) nextErrors.agreed = 'You need to agree before registering your team.';
    }
    setErrors(nextErrors);
    return nextErrors;
  };

  const focusFirstError = (nextErrors) => {
    const firstKey = Object.keys(nextErrors)[0];
    if (!firstKey) return;
    const errorStep = firstKey === 'teamName' ? 0 : firstKey.startsWith('leader.') ? 1 : firstKey.includes('.') ? 2 : step;
    setStep(errorStep);
    requestAnimationFrame(() => document.querySelector(`[name="${firstKey}"]`)?.focus());
  };

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNotice('');
    if (name.includes('.')) {
      const [memberKey, field] = name.split('.');
      setValues((current) => ({ ...current, [memberKey]: { ...current[memberKey], [field]: value } }));
    } else setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const next = () => {
    const nextErrors = validate(step);
    if (Object.keys(nextErrors).length) return focusFirstError(nextErrors);
    setStep((current) => Math.min(3, current + 1));
  };
  const back = () => { setErrors({}); setStep((current) => Math.max(0, current - 1)); };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(3);
    if (Object.keys(nextErrors).length) { focusFirstError(nextErrors); return; }

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !turnstileToken) {
      setNotice('Complete the anti-spam check before registering.');
      return;
    }

    setIsSubmitting(true);
    setNotice('');
    try {
      const result = await apiFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, turnstileToken }),
      });
      try {
        sessionStorage.removeItem('vulcan_ref_code');
      } catch {}
      onRegistered(result.payment);
    } catch (error) {
      if (error.data?.errors) {
        setErrors(error.data.errors);
        if (error.data.errors.registration) setNotice(error.data.errors.registration);
        else focusFirstError(error.data.errors);
      } else {
        setNotice(error.message || 'We could not register your team. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isClosed = eventSettings ? !eventSettings.registrationsOpen : false;
  const isSoldOut = eventSettings ? eventSettings.spotsRemaining <= 0 : false;
  const entryFee = eventSettings?.ticketPrice || 300;

  if (!loadingSettings && (isClosed || isSoldOut)) {
    return (
      <section className="event-section event-registration" id="registration" aria-labelledby="registration-title">
        <div className="event-section-inner event-registration__inner">
          <div className="event-section__heading">
            <h2 id="registration-title">{isSoldOut ? 'Event Sold Out.' : 'Registration Closed.'}</h2>
            <p>
              {isSoldOut
                ? 'All team slots for Hack-O-Lantern have been filled.'
                : eventSettings?.closeReason || 'Registrations are currently closed.'}
            </p>
          </div>
          <div className="event-form-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <button
              type="button"
              className="event-register-button"
              onClick={() => onRegistered({ status: 'lookup', orderRef: '' })}
            >
              Check Existing Registration Status <span>↘</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="event-section event-registration" id="registration" aria-labelledby="registration-title">
      <div className="event-section-inner event-registration__inner">
        <RevealHeading />
        <p className="event-registration__note">
          Teams of exactly 3. Entry: ₹{entryFee} per team.{' '}
          {eventSettings && eventSettings.spotsRemaining < 50 && (
            <span style={{ color: '#ff9a4d', fontWeight: 600 }}>
              ({eventSettings.spotsRemaining} spots remaining){' '}
            </span>
          )}
          <button
            type="button"
            className="event-inline-status-link"
            onClick={() => onRegistered({ status: 'lookup', orderRef: '' })}
          >
            Already registered? Check status
          </button>
        </p>

        {eventSettings?.eventDate && (
          <p className="event-registration__deadline">Event: {eventSettings.eventDate}</p>
        )}

        <ol className="event-form-progress" aria-label="Registration progress">
          {steps.map((label, index) => (
            <li key={label} className={index === step ? 'is-current' : index < step ? 'is-complete' : ''}>
              <span>{index + 1}</span>{label}
            </li>
          ))}
        </ol>

        <form className="event-registration-form" onSubmit={submit} noValidate>
          <div className="event-honeypot" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" value={values.company} onChange={onChange} tabIndex="-1" autoComplete="off" />
          </div>

          {step === 0 && (
            <div className="event-step">
              <label className="event-field event-field--wide" htmlFor="teamName">
                Team name
                <input
                  id="teamName"
                  name="teamName"
                  type="text"
                  minLength="2"
                  maxLength="40"
                  value={values.teamName}
                  onChange={onChange}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.teamName)}
                  aria-describedby={errors.teamName ? 'teamName-error' : undefined}
                />
                <FieldError message={errors.teamName} id="teamName-error" />
              </label>

              <label className="event-field event-field--wide" htmlFor="referralCode" style={{ marginTop: '1.25rem' }}>
                Referral code (optional)
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={values.referralCode}
                  onChange={(e) => {
                    onChange(e);
                    if (referralStatus) setReferralStatus(null);
                  }}
                  onBlur={handleReferralBlur}
                  autoComplete="off"
                  placeholder="e.g. SAP-7K3Q"
                  aria-invalid={Boolean(errors.referralCode)}
                  aria-describedby={errors.referralCode ? 'referralCode-error' : referralStatus?.message ? 'referralCode-status' : undefined}
                />
                {checkingReferral && <span className="event-field-hint">Checking code…</span>}
                {!checkingReferral && referralStatus?.ok && (
                  <span className="event-field-hint" id="referralCode-status" style={{ color: '#4ade80' }} role="status">
                    {referralStatus.message}
                  </span>
                )}
                <FieldError message={errors.referralCode} id="referralCode-error" />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="event-step">
              <MemberFields memberKey="leader" title="Member 1" leader values={values} onChange={onChange} errors={errors} />
            </div>
          )}

          {step === 2 && (
            <div className="event-step">
              <MemberFields memberKey="member2" title="Member 2" values={values} onChange={onChange} errors={errors} />
              <MemberFields memberKey="member3" title="Member 3" values={values} onChange={onChange} errors={errors} />
            </div>
          )}

          {step === 3 && (
            <div className="event-step event-review">
              <h3>Review your team</h3>
              <p><strong>{values.teamName || 'Team name'}</strong></p>
              {values.referralCode && (
                <p style={{ color: '#c6f24e', fontSize: '0.9rem' }}>
                  Referral code: <strong>{values.referralCode}</strong>
                </p>
              )}
              {memberKeys.map((memberKey, index) => (
                <p key={memberKey}>
                  {index === 0 ? 'Team leader' : `Member ${index + 1}`}: {values[memberKey].fullName || '—'} · {values[memberKey].college || '—'}
                </p>
              ))}
              <label className="event-agreement">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={values.agreed}
                  onChange={onChange}
                  aria-invalid={Boolean(errors.agreed)}
                  aria-describedby={errors.agreed ? 'agreed-error' : undefined}
                />
                <span>
                  I agree to the event rules and let Vulcan Club use these details to run this event.{' '}
                  <a href="#privacy-note">Read the privacy note.</a>
                </span>
              </label>
              <FieldError message={errors.agreed} id="agreed-error" />
              <p className="event-privacy-note" id="privacy-note">{EVENT_CONTENT.privacyNote}</p>
              <Turnstile onToken={setTurnstileToken} onError={setNotice} />
            </div>
          )}

          {notice && <p className="event-form-notice" role="status">{notice}</p>}

          <div className="event-form-actions">
            {step > 0 && (
              <button type="button" className="event-secondary-button" onClick={back} disabled={isSubmitting}>
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="event-register-button" onClick={next}>
                Continue <span aria-hidden="true">↘</span>
              </button>
            ) : (
              <button type="submit" className="event-register-button" disabled={isSubmitting}>
                {isSubmitting ? 'Registering…' : 'Confirm team'} <span aria-hidden="true">↘</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function RevealHeading() {
  return (
    <div className="event-section__heading">
      <h2 id="registration-title">Bring your whole coven.</h2>
      <p>Register your three-person team here.</p>
    </div>
  );
}
