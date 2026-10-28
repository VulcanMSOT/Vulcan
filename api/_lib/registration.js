import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../../src/server/prisma.js';
import { validateCoupon } from './coupons.js';
import { normalizeReferralCode, validateReferralCode } from './referral.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const memberKeys = ['leader', 'member2', 'member3'];
const AMBIGUOUS_CHARS_REGEX = /[0O1I]/g;

export function normalizePhone(value) {
  return String(value || '').replace(/[\s-]/g, '').replace(/^\+91/, '');
}

function clean(value) { return String(value || '').trim(); }
function normalise(value) { return clean(value).toLocaleLowerCase('en-IN'); }

export async function getEventSettings() {
  try {
    let settings = await prisma.eventSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.eventSettings.create({
        data: {
          id: 'default',
          eventName: 'Hack-O-Lantern',
          eventDate: '31 Oct 2026, 7:00 PM – 1 Nov 2026, 11:00 AM',
          eventVenue: 'Mirai Floor, Bengaluru',
          registrationsOpen: true,
          maxCapacity: 100,
          ticketPrice: 300,
          upiId: process.env.NEXT_PUBLIC_UPI_ID || 'himangshuyadav2@oksbi',
        },
      });
    }

    const currentCount = await prisma.registration.count({
      where: {
        paymentStatus: { in: ['PAID', 'PENDING_REVIEW', 'PENDING_PAYMENT'] },
      },
    });

    const now = new Date();
    const spotsRemaining = Math.max(0, settings.maxCapacity - currentCount);
    let isOpen = settings.registrationsOpen;
    let closeReason = '';

    if (!isOpen) {
      closeReason = 'Registrations are currently closed by organisers.';
    } else if (settings.opensAt && now < settings.opensAt) {
      isOpen = false;
      closeReason = `Registrations open on ${new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(settings.opensAt)}.`;
    } else if (settings.closesAt && now > settings.closesAt) {
      isOpen = false;
      closeReason = 'Registration deadline has passed.';
    } else if (spotsRemaining <= 0) {
      isOpen = false;
      closeReason = 'Event is sold out. Maximum capacity reached.';
    }

    return {
      settings,
      currentCount,
      spotsRemaining,
      isOpen,
      closeReason,
    };
  } catch (error) {
    console.error('Error fetching event settings:', error);
    return {
      settings: {
        eventName: 'Hack-O-Lantern',
        eventDate: '31 Oct 2026, 7:00 PM',
        eventVenue: 'Mirai Floor, Bengaluru',
        registrationsOpen: true,
        maxCapacity: 100,
        ticketPrice: 300,
        upiId: process.env.NEXT_PUBLIC_UPI_ID || 'himangshuyadav2@oksbi',
      },
      currentCount: 0,
      spotsRemaining: 100,
      isOpen: true,
      closeReason: '',
    };
  }
}

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

export function createPaymentRef() {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let chars = '';
  while (chars.length < 6) {
    const bytes = randomBytes(12);
    for (let i = 0; i < bytes.length && chars.length < 6; i++) {
      const char = alphabet[bytes[i] % alphabet.length];
      if (!char.match(AMBIGUOUS_CHARS_REGEX)) {
        chars += char;
      }
    }
  }
  return `PAY-${chars.slice(0, 6)}`;
}

export async function generateTeamId(tx) {
  const res = await tx.$queryRaw`SELECT nextval('public.team_id_seq') AS seq`;
  const seq = res[0]?.seq || 1001;
  return `VHK-${String(seq).padStart(4, '0')}`;
}

export function createTicketToken() {
  return randomBytes(24).toString('base64url');
}

function hashSecret(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function manualPaymentDetails(paymentRef, amount = 300, upiIdOverride = null) {
  const vpa = clean(upiIdOverride || process.env.NEXT_PUBLIC_UPI_ID || process.env.UPI_VPA || 'himangshuyadav2@oksbi');
  const payee = clean(process.env.UPI_PAYEE_NAME || 'Vulcan');
  const params = new URLSearchParams({
    pa: vpa,
    pn: payee,
    am: String(amount),
    cu: 'INR',
    tn: paymentRef || 'Hack-O-Lantern',
  });
  return { amount, vpa, uri: `upi://pay?${params.toString()}` };
}

export async function verifyTurnstile(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // If not configured, allow registration on free tier
  if (!secret) return { ok: true, reason: '' };
  if (!token || typeof token !== 'string') return { ok: false, reason: 'Complete the anti-spam check before registering.' };
  try {
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip }),
    });
    const payload = await result.json();
    return { ok: payload.success === true, reason: 'The anti-spam check expired. Please try again.' };
  } catch {
    return { ok: true, reason: '' };
  }
}

export async function enforceRateLimit(ip) {
  // Rate limiting disabled per organiser requirement so campus networks & high-volume registrations are never throttled
  return true;
}

export async function createRegistration(input) {
  const { errors, teamName, normalizedTeamName, members } = validateRegistration(input);
  if (Object.keys(errors).length) return { errors };

  let validatedReferrer = null;
  const rawRefCode = input.referralCode ? normalizeReferralCode(input.referralCode) : null;
  if (rawRefCode) {
    const refCheck = await validateReferralCode(rawRefCode, { teamMembers: members });
    if (!refCheck.valid) {
      return { errors: { referralCode: refCheck.error || "That referral code isn't valid." } };
    }
    validatedReferrer = refCheck;
  }

  return prisma.$transaction(async (tx) => {
    // 1. Enforce Event Settings & Race-Safe Capacity Check
    const settings = await tx.eventSettings.findUnique({ where: { id: 'default' } });
    if (!settings || !settings.registrationsOpen) {
      return { errors: { registration: 'Registrations are currently closed.' } };
    }
    const now = new Date();
    if (settings.opensAt && now < settings.opensAt) {
      return { errors: { registration: 'Registrations have not opened yet.' } };
    }
    if (settings.closesAt && now > settings.closesAt) {
      return { errors: { registration: 'Registrations have closed.' } };
    }

    const currentCount = await tx.registration.count({
      where: { paymentStatus: { in: ['PAID', 'PENDING_REVIEW', 'PENDING_PAYMENT'] } },
    });
    if (currentCount >= settings.maxCapacity) {
      return { errors: { registration: 'Event is sold out. Maximum capacity reached.' } };
    }

    // 2. Check duplicate team name & members
    const [existingTeam, existingMembers] = await Promise.all([
      tx.registration.findUnique({ where: { normalizedTeamName }, select: { id: true } }),
      tx.teamMember.findMany({
        where: {
          OR: [
            { normalizedEmail: { in: members.map((m) => m.email) } },
            { normalizedPhone: { in: members.map((m) => m.phone) } },
          ],
        },
        select: { normalizedEmail: true, normalizedPhone: true },
      }),
    ]);

    if (existingTeam) return { errors: { teamName: 'That team name is already registered.' } };
    if (existingMembers.length) {
      const existingEmails = new Set(existingMembers.map((m) => m.normalizedEmail));
      const existingPhones = new Set(existingMembers.map((m) => m.normalizedPhone));
      const duplicateErrors = {};
      members.forEach((member, index) => {
        const key = memberKeys[index];
        if (existingEmails.has(member.email)) duplicateErrors[`${key}.email`] = 'This email address is already registered for another team.';
        if (existingPhones.has(member.phone)) duplicateErrors[`${key}.phone`] = 'This phone number is already registered for another team.';
      });
      return { errors: duplicateErrors };
    }

    // 3. Generate unique identifiers inside transaction
    const teamId = await generateTeamId(tx);
    let paymentRef = createPaymentRef();
    let refAttempts = 0;
    while (refAttempts < 5) {
      const conflict = await tx.registration.findUnique({ where: { paymentRef } });
      if (!conflict) break;
      paymentRef = createPaymentRef();
      refAttempts++;
    }

    const paymentToken = randomBytes(24).toString('base64url');
    const amount = settings.ticketPrice || 300;

    const registration = await tx.registration.create({
      data: {
        teamName,
        normalizedTeamName,
        teamId,
        orderRef: teamId,
        paymentRef,
        amount,
        listPrice: amount,
        discountAmount: 0,
        couponCode: null,
        referralCode: validatedReferrer ? validatedReferrer.code : null,
        paymentStatus: 'PENDING_PAYMENT',
        paymentTokenHash: hashSecret(paymentToken),
        emailStatus: 'not_sent',
        emailSentCount: 0,
        members: {
          create: members.map((member, index) => ({
            position: index + 1,
            fullName: member.fullName,
            email: member.email,
            normalizedEmail: member.email,
            phone: member.phone,
            normalizedPhone: member.phone,
            college: member.college,
          })),
        },
      },
      include: { members: { orderBy: { position: 'asc' } } },
    });

    if (validatedReferrer) {
      await tx.referral.create({
        data: {
          referrerId: validatedReferrer.referrerId,
          referredTeamId: registration.id,
          status: 'pending',
        },
      });
    }

    return {
      registration,
      paymentToken,
      settings,
    };
  }, { maxWait: 10000, timeout: 20000 });
}

export async function submitPaymentReference({ registrationId, paymentToken, utr, screenshotPath }) {
  const candidateUtr = clean(utr);
  if (!/^\d{12}$/.test(candidateUtr)) {
    return { error: 'Please enter a valid 12-digit UPI transaction reference (UTR).' };
  }
  if (!registrationId || !paymentToken) {
    return { error: 'This payment request is no longer available. Please register again.' };
  }

  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
      paymentTokenHash: hashSecret(paymentToken),
      paymentStatus: { in: ['PENDING_PAYMENT', 'REJECTED'] },
    },
    select: { id: true, teamId: true, paymentRef: true, couponCode: true },
  });

  if (!registration) {
    return { error: 'This payment request is not available for submission or has already been reviewed.' };
  }

  // Validate coupon is still active if one was applied
  if (registration.couponCode) {
    const couponValidation = await validateCoupon(registration.couponCode);
    if (!couponValidation.valid) {
      return { error: 'The coupon code applied to this registration is no longer active. Please remove or re-apply a valid coupon.' };
    }
  }

  // Check duplicate UTR across other registrations
  const duplicate = await prisma.registration.findFirst({
    where: {
      utr: candidateUtr,
      id: { not: registration.id },
    },
    select: { id: true },
  });
  if (duplicate) {
    return { error: 'This UTR has already been submitted for another registration. Please double check and enter your unique UTR.' };
  }

  try {
    await prisma.registration.update({
      where: { id: registration.id },
      data: {
        utr: candidateUtr,
        paymentReference: candidateUtr,
        screenshotPath: screenshotPath ? String(screenshotPath).slice(0, 255) : null,
        paymentStatus: 'PENDING_REVIEW',
        paymentSubmittedAt: new Date(),
        rejectReason: null,
      },
    });
    return {
      ok: true,
      teamId: registration.teamId,
      paymentRef: registration.paymentRef,
      message: 'Payment submitted for organiser review. Your ticket will be issued after it is verified.',
    };
  } catch (error) {
    if (error.code === 'P2002') return { error: 'That UTR was already submitted. Check it and try again.' };
    throw error;
  }
}

export async function paymentTicketStatus({ registrationId, paymentToken, teamId, orderRef, paymentRef }) {
  const where = registrationId && paymentToken
    ? { id: registrationId, paymentTokenHash: hashSecret(paymentToken) }
    : teamId
      ? { teamId: clean(teamId).toUpperCase() }
      : paymentRef
        ? { paymentRef: clean(paymentRef).toUpperCase() }
        : orderRef
          ? { orderRef: clean(orderRef).toUpperCase() }
          : null;

  if (!where) return { error: 'This payment request is no longer available.' };

  const registration = await prisma.registration.findFirst({
    where,
    include: { members: { orderBy: { position: 'asc' } } },
  });
  if (!registration) return { error: 'No matching registration was found.' };

  const baseResponse = {
    status: registration.paymentStatus,
    teamId: registration.teamId || registration.orderRef,
    paymentRef: registration.paymentRef || 'PAY-PENDING',
    orderRef: registration.orderRef,
    amount: registration.amount,
    listPrice: registration.listPrice,
    couponCode: registration.couponCode,
    discountAmount: registration.discountAmount,
    utr: registration.utr,
    rejectReason: registration.rejectReason,
  };

  if (registration.paymentStatus !== 'PAID' || !registration.ticketId) {
    return baseResponse;
  }

  const settings = await prisma.eventSettings.findFirst({ where: { id: 'default' } });
  const eligibleCollege = settings?.eligibleCollegeName || 'Mirai School of Technology';

  const miraiMembers = registration.members.filter((m) => m.college === eligibleCollege);
  let referralCodes = [];
  if (miraiMembers.length > 0) {
    const memberEmails = miraiMembers.map((m) => m.normalizedEmail.toLowerCase());
    const referrers = await prisma.referrer.findMany({
      where: {
        email: { in: memberEmails },
        active: true,
      },
      select: { name: true, code: true },
    });
    referralCodes = referrers.map((ref) => ({
      name: ref.name,
      code: ref.code,
      shareUrl: `/halloween-hack?ref=${ref.code}`,
    }));
  }

  return {
    ...baseResponse,
    status: 'PAID',
    ticket: {
      ticketId: registration.ticketId,
      ticketToken: registration.ticketToken,
      teamId: registration.teamId || registration.orderRef,
      paymentRef: registration.paymentRef,
      teamName: registration.teamName,
      members: registration.members.map(({ position, fullName }) => ({ position, fullName })),
      verifyPayload: `${registration.teamId || registration.ticketId}:${registration.ticketToken || registration.ticketId}`,
      referralCodes,
      referralRewardText: settings?.referralRewardText ? settings.referralRewardText.trim() : '',
    },
    referralCodes,
    referralRewardText: settings?.referralRewardText ? settings.referralRewardText.trim() : '',
  };
}

export async function lookupRegistrationStatus({ identifier, email }) {
  const cleanId = clean(identifier).toUpperCase();
  const cleanEmail = clean(email).toLowerCase();

  if (!cleanId || !cleanEmail) {
    return { error: 'Enter your Team ID (e.g. VHK-1001) and team leader email.' };
  }

  const registration = await prisma.registration.findFirst({
    where: {
      OR: [
        { teamId: cleanId },
        { paymentRef: cleanId },
        { orderRef: cleanId },
      ],
      members: {
        some: {
          position: 1,
          normalizedEmail: cleanEmail,
        },
      },
    },
    include: {
      members: { orderBy: { position: 'asc' } },
    },
  });

  if (!registration) {
    return { error: 'No registration was found matching that Team ID and leader email.' };
  }

  // Generate a fresh session token if the team needs to resubmit payment
  let resubmitToken = null;
  if (registration.paymentStatus === 'REJECTED' || registration.paymentStatus === 'PENDING_PAYMENT') {
    resubmitToken = randomBytes(24).toString('base64url');
    await prisma.registration.update({
      where: { id: registration.id },
      data: { paymentTokenHash: hashSecret(resubmitToken) },
    });
  }

  let referralCodes = [];
  let referralRewardText = '';
  if (registration.paymentStatus === 'PAID') {
    const settings = await prisma.eventSettings.findUnique({ where: { id: 'default' } });
    referralRewardText = settings?.referralRewardText ? settings.referralRewardText.trim() : '';

    const memberEmails = registration.members.map((m) => m.normalizedEmail);
    const referrers = await prisma.referrer.findMany({
      where: {
        email: { in: memberEmails },
        active: true,
      },
      select: { name: true, code: true },
    });
    referralCodes = referrers.map((ref) => ({
      name: ref.name,
      code: ref.code,
      shareUrl: `/halloween-hack?ref=${ref.code}`,
    }));
  }

  return {
    found: true,
    status: registration.paymentStatus,
    teamId: registration.teamId || registration.orderRef,
    paymentRef: registration.paymentRef,
    orderRef: registration.orderRef,
    teamName: registration.teamName,
    amount: registration.amount,
    listPrice: registration.listPrice,
    couponCode: registration.couponCode,
    discountAmount: registration.discountAmount,
    utr: registration.utr,
    rejectReason: registration.rejectReason,
    ticketId: registration.ticketId,
    ticketToken: registration.ticketToken,
    paymentToken: resubmitToken,
    registrationId: registration.id,
    leaderEmail: cleanEmail,
    referralCodes,
    referralRewardText,
    ticket: registration.paymentStatus === 'PAID' && registration.ticketId ? {
      ticketId: registration.ticketId,
      ticketToken: registration.ticketToken,
      teamId: registration.teamId || registration.orderRef,
      paymentRef: registration.paymentRef,
      teamName: registration.teamName,
      members: registration.members.map(({ position, fullName }) => ({ position, fullName })),
      verifyPayload: `${registration.teamId || registration.ticketId}:${registration.ticketToken || registration.ticketId}`,
      referralCodes,
      referralRewardText,
    } : null,
  };
}
