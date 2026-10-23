import { useEffect, useMemo, useRef, useState } from 'react';
import { EVENT_CONTENT } from '../../eventContent';

const memberKeys = ['leader', 'member2', 'member3'];
const initialMember = { fullName: '', email: '', phone: '', college: '' };
const initialValues = {
  teamName: '',
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

function MemberFields({ memberKey, title, leader, values, onChange, errors }) {
  const member = values[memberKey];
  const base = `member-${memberKey}`;
  const fields = [
    ['fullName', 'Full name', 'text', 'name'],
    ['email', 'Email address', 'email', 'email'],
    ['phone', 'Contact phone number', 'tel', 'tel'],
    ['college', 'College / organisation', 'text', 'organization'],
  ];
  return (
    <fieldset className="event-member-fields">
      <legend>{title}{leader && <span>Team leader</span>}</legend>
      <div className="event-form-grid">
        {fields.map(([field, label, type, autocomplete]) => {
          const error = errors[`${memberKey}.${field}`];
          const id = `${base}-${field}`;
          return <label className="event-field" key={field} htmlFor={id}>{label}
            <input id={id} name={`${memberKey}.${field}`} type={type} value={member[field]} onChange={onChange} autoComplete={autocomplete} inputMode={type === 'tel' ? 'tel' : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
            <FieldError message={error} id={`${id}-error`} />
          </label>;
        })}
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

  if (!siteKey) return <p className="event-turnstile-config" role="status">Anti-spam protection is not configured yet. Registration will open when it is ready.</p>;
  return <div className="event-turnstile" ref={containerRef} />;
}

export default function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const deadlineIsConfigured = EVENT_CONTENT.registrationDeadline && !EVENT_CONTENT.registrationDeadline.startsWith('[');
  const registrationClosed = deadlineIsConfigured && new Date(EVENT_CONTENT.registrationDeadline).getTime() < currentTime;

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
    if (!import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      setNotice('Registration is not open yet. The anti-spam check has not been configured.');
      return;
    }
    if (!turnstileToken) {
      setNotice('Complete the anti-spam check before registering.');
      return;
    }
    setIsSubmitting(true);
    setNotice('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, turnstileToken }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
          if (result.errors.registration) setNotice(result.errors.registration);
          else focusFirstError(result.errors);
        }
        else setNotice(result.error || 'We could not register your team. Please try again.');
        return;
      }
      setNotice(`Your team is registered. Ticket ${result.ticket.ticketId} is ready.`);
    } catch {
      setNotice('We could not reach registration securely. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationClosed) return <section className="event-section event-registration" id="registration"><h2>Registration closed.</h2><p>The registration deadline has passed.</p></section>;

  return (
    <section className="event-section event-registration" id="registration" aria-labelledby="registration-title">
      <RevealHeading />
      <p className="event-registration__note">Teams of exactly 3. Free to register.</p>
      {deadlineIsConfigured && <p className="event-registration__deadline">Register by {EVENT_CONTENT.registrationDeadline}</p>}
      <ol className="event-form-progress" aria-label="Registration progress">{steps.map((label, index) => <li key={label} className={index === step ? 'is-current' : index < step ? 'is-complete' : ''}><span>{index + 1}</span>{label}</li>)}</ol>
      <form className="event-registration-form" onSubmit={submit} noValidate>
        <div className="event-honeypot" aria-hidden="true"><label htmlFor="company">Company</label><input id="company" name="company" value={values.company} onChange={onChange} tabIndex="-1" autoComplete="off" /></div>
        {step === 0 && <div className="event-step"><label className="event-field event-field--wide" htmlFor="teamName">Team name<input id="teamName" name="teamName" type="text" minLength="2" maxLength="40" value={values.teamName} onChange={onChange} autoComplete="off" aria-invalid={Boolean(errors.teamName)} aria-describedby={errors.teamName ? 'teamName-error' : undefined} /><FieldError message={errors.teamName} id="teamName-error" /></label></div>}
        {step === 1 && <div className="event-step"><MemberFields memberKey="leader" title="Member 1" leader values={values} onChange={onChange} errors={errors} /></div>}
        {step === 2 && <div className="event-step"><MemberFields memberKey="member2" title="Member 2" values={values} onChange={onChange} errors={errors} /><MemberFields memberKey="member3" title="Member 3" values={values} onChange={onChange} errors={errors} /></div>}
        {step === 3 && <div className="event-step event-review"><h3>Review your team</h3><p><strong>{values.teamName || 'Team name'}</strong></p>{memberKeys.map((memberKey, index) => <p key={memberKey}>{index === 0 ? 'Team leader' : `Member ${index + 1}`}: {values[memberKey].fullName || '—'} · {values[memberKey].college || '—'}</p>)}<label className="event-agreement"><input type="checkbox" name="agreed" checked={values.agreed} onChange={onChange} aria-invalid={Boolean(errors.agreed)} aria-describedby={errors.agreed ? 'agreed-error' : undefined} /> <span>I agree to the event rules and let Vulcan Club use these details to run this event. <a href="#privacy-note">Read the privacy note.</a></span></label><FieldError message={errors.agreed} id="agreed-error" /><p className="event-privacy-note" id="privacy-note">{EVENT_CONTENT.privacyNote}</p><Turnstile onToken={setTurnstileToken} onError={setNotice} /></div>}
        {notice && <p className="event-form-notice" role="status">{notice}</p>}
        <div className="event-form-actions">{step > 0 && <button type="button" className="event-secondary-button" onClick={back} disabled={isSubmitting}>Back</button>}{step < 3 ? <button type="button" className="event-register-button" onClick={next}>Continue <span aria-hidden="true">↘</span></button> : <button type="submit" className="event-register-button" disabled={isSubmitting}>{isSubmitting ? 'Registering…' : 'Confirm team'} <span aria-hidden="true">↘</span></button>}</div>
      </form>
    </section>
  );
}

function RevealHeading() {
  return <div className="event-section__heading"><h2 id="registration-title">Bring your whole coven.</h2><p>Register your three-person team here.</p></div>;
}
