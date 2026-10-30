import { createHash } from 'node:crypto';
import { prisma } from '../../src/server/prisma.js';

const GENERIC_COUPON_ERROR = "That code isn't valid.";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

function hashValue(val) {
  return createHash('sha256').update(String(val || '')).digest('hex');
}

/**
 * Normalise coupon input: lowercase and trimmed.
 */
export function normaliseCode(code) {
  return String(code || '').trim().toLowerCase();
}

/**
 * Rate limit invalid coupon attempts per IP and team ID.
 * Max 5 failed attempts per 10 minutes.
 */
export async function checkCouponRateLimit(ip, teamIdentifier = '') {
  const secret = process.env.ORGANISER_SESSION_SECRET || 'coupon-rate-limit-secret';
  const key = `cprate:${hashValue(`${secret}:${ip}:${teamIdentifier}`)}`;
  const now = new Date();

  const record = await prisma.registrationRateLimit.findUnique({ where: { key } });
  if (!record || now.getTime() - record.windowStarted.getTime() >= RATE_LIMIT_WINDOW_MS) {
    return { allowed: true, key };
  }

  if (record.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, key, error: GENERIC_COUPON_ERROR };
  }

  return { allowed: true, key };
}

/**
 * Record a failed coupon attempt against rate limit.
 * Never logs the full raw coupon guess.
 */
export async function recordFailedCouponAttempt(key, rawCode = '') {
  const now = new Date();
  const truncatedOrHashed = rawCode ? `${rawCode.slice(0, 3)}...#${hashValue(rawCode).slice(0, 8)}` : 'empty';
  console.warn(`[Coupon] Invalid attempt recorded for key ${key.slice(0, 16)}: attempt pattern ${truncatedOrHashed}`);

  await prisma.registrationRateLimit.upsert({
    where: { key },
    create: { key, windowStarted: now, attempts: 1 },
    update: { attempts: { increment: 1 } },
  });
}

/**
 * Reset/clear rate limit on a successful coupon application.
 */
export async function clearCouponRateLimit(key) {
  try {
    await prisma.registrationRateLimit.delete({ where: { key } });
  } catch {
    // Ignore if not exists
  }
}

/**
 * Validate coupon existence, active status, expiration, and usage limits.
 */
export async function validateCoupon(code) {
  const normalised = normaliseCode(code);
  if (!normalised) {
    return { valid: false, error: GENERIC_COUPON_ERROR };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: normalised } });
  if (!coupon || !coupon.active) {
    return { valid: false, error: GENERIC_COUPON_ERROR };
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return { valid: false, error: GENERIC_COUPON_ERROR };
  }

  if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: GENERIC_COUPON_ERROR };
  }

  return { valid: true, coupon };
}

/**
 * Applies a coupon to a team's registration before UTR submission.
 */
export async function applyCoupon({ identifier, paymentToken, code, ip }) {
  const cleanId = String(identifier || '').trim().toUpperCase();
  const rateLimit = await checkCouponRateLimit(ip, cleanId);
  if (!rateLimit.allowed) {
    return { error: GENERIC_COUPON_ERROR };
  }

  // Find registration
  const registration = await prisma.registration.findFirst({
    where: {
      OR: [
        { teamId: cleanId },
        { paymentRef: cleanId },
        { orderRef: cleanId },
      ],
    },
    include: {
      members: true,
    },
  });

  if (!registration) {
    return { error: 'Registration not found.' };
  }

  // Token validation if token provided
  if (paymentToken && registration.paymentTokenHash) {
    const expectedHash = hashValue(paymentToken);
    if (registration.paymentTokenHash !== expectedHash) {
      return { error: 'Invalid payment session.' };
    }
  }

  // State check: coupon can only be applied BEFORE UTR submission
  if (registration.paymentStatus !== 'PENDING_PAYMENT') {
    return { error: 'Payment reference has already been submitted and the amount is locked.' };
  }

  // Validate coupon
  const validation = await validateCoupon(code);
  if (!validation.valid) {
    await recordFailedCouponAttempt(rateLimit.key, code);
    return { error: GENERIC_COUPON_ERROR };
  }

  const coupon = validation.coupon;
  const listPrice = registration.listPrice || 300;
  const discountAmount = coupon.value;
  const finalAmount = Math.max(listPrice - discountAmount, 0);

  if (finalAmount === 0) {
    throw new Error('Zero final amount reached. Please ask organiser for assistance.');
  }

  // Apply to registration
  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: {
      couponCode: coupon.code,
      discountAmount,
      amount: finalAmount,
    },
  });

  await clearCouponRateLimit(rateLimit.key);

  return {
    ok: true,
    listPrice: updated.listPrice,
    couponCode: updated.couponCode,
    discountAmount: updated.discountAmount,
    amount: updated.amount,
  };
}

/**
 * Removes coupon from a registration before UTR submission.
 */
export async function removeCoupon({ identifier, paymentToken }) {
  const cleanId = String(identifier || '').trim().toUpperCase();

  const registration = await prisma.registration.findFirst({
    where: {
      OR: [
        { teamId: cleanId },
        { paymentRef: cleanId },
        { orderRef: cleanId },
      ],
    },
  });

  if (!registration) {
    return { error: 'Registration not found.' };
  }

  if (paymentToken && registration.paymentTokenHash) {
    const expectedHash = hashValue(paymentToken);
    if (registration.paymentTokenHash !== expectedHash) {
      return { error: 'Invalid payment session.' };
    }
  }

  if (registration.paymentStatus !== 'PENDING_PAYMENT') {
    return { error: 'Payment reference has already been submitted and the amount is locked.' };
  }

  const listPrice = registration.listPrice || 300;

  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: {
      couponCode: null,
      discountAmount: 0,
      amount: listPrice,
    },
  });

  return {
    ok: true,
    listPrice: updated.listPrice,
    couponCode: null,
    discountAmount: 0,
    amount: updated.amount,
  };
}
