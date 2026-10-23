import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../../src/server/prisma.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const memberKeys = ['leader', 'member2', 'member3'];

export function normalizePhone(value) {
  return String(value || '').replace(/[\s-]/g, '').replace(/^\+91/, '');
}

function clean(value) { return String(value || '').trim(); }
function normalise(value) { return clean(value).toLocaleLowerCase('en-IN'); }

export function validateRegistration(input) {
  const errors = {};
  const teamName = clean(input.teamName);
  if (teamName.length < 2 || teamName.length > 40) errors.teamName = 'Use a team name between 2 and 40 characters.';
  const members = memberKeys.map((key) => {
    const member = input[key] || {};
    const fullName = clean(member.fullName);
    const email = clean(member.email).toLowerCase();
    const phone = clean(member.phone);
    const normalizedPhone = normalizePhone(phone);
    const college = clean(member.college);
    if (!fullName || fullName.length > 100) errors[`${key}.fullName`] = 'Enter a full name of up to 100 characters.';
    if (!emailPattern.test(email)) errors[`${key}.email`] = 'Enter a valid email address.';
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) errors[`${key}.phone`] = 'Use a 10-digit Indian mobile number. +91 is accepted.';
    if (college.length < 2 || college.length > 80) errors[`${key}.college`] = 'Enter a college or organisation between 2 and 80 characters.';
    return { fullName, email, phone: normalizedPhone, college };
  });
  if (!input.agreed) errors.agreed = 'You need to agree before registering your team.';
  if (new Set(members.map((member) => member.email)).size !== 3) errors['leader.email'] = 'Each team member needs a different email address.';
  if (new Set(members.map((member) => member.phone)).size !== 3) errors['leader.phone'] = 'Each team member needs a different phone number.';
  return { errors, teamName, normalizedTeamName: normalise(teamName), members };
}

export function createTicketId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const chars = Array.from(randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join('');
  return `VULCAN-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

function hashSecret(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function manualPaymentDetails(registrationId) {
  const vpa = clean(process.env.UPI_VPA);
  if (!vpa) return null;
  const params = new URLSearchParams({
    pa: vpa,
    pn: process.env.UPI_PAYEE_NAME || 'Vulcan Club',
    am: '300',
    cu: 'INR',
    tn: `Hack-O-Lantern ${registrationId}`,
  });
  return { amount: 300, vpa, uri: `upi://pay?${params.toString()}` };
}

export async function verifyTurnstile(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: process.env.NODE_ENV !== 'production', reason: 'Turnstile is not configured.' };
  if (!token || typeof token !== 'string') return { ok: false, reason: 'Complete the anti-spam check before registering.' };
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip }),
  });
  const payload = await result.json();
  return { ok: payload.success === true, reason: 'The anti-spam check expired. Please try again.' };
}

export async function enforceRateLimit(ip) {
  const secret = process.env.ORGANISER_SESSION_SECRET || 'development-only-rate-limit-secret';
  const key = createHash('sha256').update(`${secret}:${ip}`).digest('hex');
  const now = new Date();
  const windowMs = 60 * 60 * 1000;
  const limit = 5;
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.registrationRateLimit.findUnique({ where: { key } });
    if (!existing || now.getTime() - existing.windowStarted.getTime() >= windowMs) {
      await transaction.registrationRateLimit.upsert({ where: { key }, create: { key, windowStarted: now, attempts: 1 }, update: { windowStarted: now, attempts: 1 } });
      return true;
    }
    if (existing.attempts >= limit) return false;
    await transaction.registrationRateLimit.update({ where: { key }, data: { attempts: { increment: 1 } } });
    return true;
  });
}

export async function createRegistration(input) {
  const { errors, teamName, normalizedTeamName, members } = validateRegistration(input);
  if (Object.keys(errors).length) return { errors };
  const [existingTeam, existingMembers] = await Promise.all([
    prisma.registration.findUnique({ where: { normalizedTeamName }, select: { id: true } }),
    prisma.teamMember.findMany({
      where: {
        OR: [
          { normalizedEmail: { in: members.map((member) => member.email) } },
          { normalizedPhone: { in: members.map((member) => member.phone) } },
        ],
      },
      select: { normalizedEmail: true, normalizedPhone: true },
    }),
  ]);
  if (existingTeam) return { errors: { teamName: 'That team name is already registered.' } };
  if (existingMembers.length) {
    const existingEmails = new Set(existingMembers.map((member) => member.normalizedEmail));
    const existingPhones = new Set(existingMembers.map((member) => member.normalizedPhone));
    const duplicateErrors = {};
    members.forEach((member, index) => {
      const key = memberKeys[index];
      if (existingEmails.has(member.email)) duplicateErrors[`${key}.email`] = 'This email address is already registered for another team.';
      if (existingPhones.has(member.phone)) duplicateErrors[`${key}.phone`] = 'This phone number is already registered for another team.';
    });
    return { errors: duplicateErrors };
  }
  const paymentToken = randomBytes(24).toString('base64url');
  try {
    const registration = await prisma.registration.create({
      data: {
        teamName,
        normalizedTeamName,
        paymentTokenHash: hashSecret(paymentToken),
        members: { create: members.map((member, index) => ({ position: index + 1, fullName: member.fullName, email: member.email, normalizedEmail: member.email, phone: member.phone, normalizedPhone: member.phone, college: member.college })) },
      },
      include: { members: { orderBy: { position: 'asc' } } },
    });
    return { registration, paymentToken };
  } catch (error) {
    if (error.code === 'P2002') {
      return { errors: { registration: 'A matching registration was just submitted. Review the team name, emails, and phone numbers, then try again.' } };
    }
    throw error;
  }
}

export async function submitPaymentReference({ registrationId, paymentToken, paymentReference }) {
  const reference = clean(paymentReference);
  if (!registrationId || !paymentToken || !/^[A-Za-z0-9._/-]{6,100}$/.test(reference)) {
    return { error: 'Enter the UPI transaction reference shown by your payment app.' };
  }
  const registration = await prisma.registration.findFirst({
    where: { id: registrationId, paymentTokenHash: hashSecret(paymentToken), paymentStatus: 'PENDING_PAYMENT' },
    select: { id: true },
  });
  if (!registration) return { error: 'This payment request is no longer available. Please register again.' };
  try {
    await prisma.registration.update({
      where: { id: registration.id },
      data: { paymentReference: reference, paymentStatus: 'PENDING_REVIEW', paymentSubmittedAt: new Date() },
    });
    return { ok: true };
  } catch (error) {
    if (error.code === 'P2002') return { error: 'That payment reference was already submitted. Check it and try again.' };
    throw error;
  }
}
