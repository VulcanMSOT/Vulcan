import { useMemo, useState } from 'react';
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

export default function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
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
      if (new Set(emails).size !== emails.length) nextErrors['leader.email'] = 'Each team member needs a different email address.';
      if (new Set(phones).size !== phones.length) nextErrors['leader.phone'] = 'Each team member needs a different phone number.';
      if (!values.agreed) nextErrors.agreed = 'You need to agree before registering your team.';
    }
    setErrors(nextErrors);
    return nextErrors;
  };

  const focusFirstError = (nextErrors) => {
    const firstKey = Object.keys(nextErrors)[0];
    if (!firstKey) return;
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
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate(3);
    if (Object.keys(nextErrors).length) { focusFirstError(nextErrors); return; }
    setNotice('Secure registration is being connected. Your details have not been sent yet.');
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
        {step === 3 && <div className="event-step event-review"><h3>Review your team</h3><p><strong>{values.teamName || 'Team name'}</strong></p>{memberKeys.map((memberKey, index) => <p key={memberKey}>{index === 0 ? 'Team leader' : `Member ${index + 1}`}: {values[memberKey].fullName || '—'} · {values[memberKey].college || '—'}</p>)}<label className="event-agreement"><input type="checkbox" name="agreed" checked={values.agreed} onChange={onChange} aria-invalid={Boolean(errors.agreed)} aria-describedby={errors.agreed ? 'agreed-error' : undefined} /> <span>I agree to the event rules and let Vulcan Club use these details to run this event. <a href="#privacy-note">Read the privacy note.</a></span></label><FieldError message={errors.agreed} id="agreed-error" /><p className="event-privacy-note" id="privacy-note">{EVENT_CONTENT.privacyNote}</p></div>}
        {notice && <p className="event-form-notice" role="status">{notice}</p>}
        <div className="event-form-actions">{step > 0 && <button type="button" className="event-secondary-button" onClick={back}>Back</button>}{step < 3 ? <button type="button" className="event-register-button" onClick={next}>Continue <span aria-hidden="true">↘</span></button> : <button type="submit" className="event-register-button">Confirm team <span aria-hidden="true">↘</span></button>}</div>
      </form>
    </section>
  );
}

function RevealHeading() {
  return <div className="event-section__heading"><h2 id="registration-title">Bring your whole coven.</h2><p>Register your three-person team here.</p></div>;
}
