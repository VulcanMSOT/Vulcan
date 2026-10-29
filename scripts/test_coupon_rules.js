import assert from 'node:assert';
import dotenv from 'dotenv';
import { prisma } from '../src/server/prisma.js';
import { applyCoupon, removeCoupon } from '../api/_lib/coupons.js';
import { submitPaymentReference } from '../api/_lib/registration.js';

dotenv.config({ path: '.env.local' });

async function runTests() {
  console.log('--- Starting Coupon Rules Verification ---');

  // Clean up any existing test registrations
  await prisma.registration.deleteMany({
    where: { teamId: { startsWith: 'TEST-' } },
  });

  // Ensure test coupons are active
  await prisma.coupon.updateMany({
    where: { code: { in: ['halloween_night', 'last_minute'] } },
    data: { active: true },
  });

  // 1. Setup a test registration
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const testTeamId = `TEST-CPN-${rand}`;
  const testPaymentRef = `PAY-CPN-${rand}`;
  const paymentToken = `test-token-${rand}`;
  const { createHash } = await import('node:crypto');
  const tokenHash = createHash('sha256').update(paymentToken).digest('hex');

  const testReg = await prisma.registration.create({
    data: {
      teamName: 'Test Coupon Team',
      normalizedTeamName: `test coupon team ${Date.now()}`,
      teamId: testTeamId,
      orderRef: testTeamId,
      paymentRef: testPaymentRef,
      amount: 300,
      listPrice: 300,
      discountAmount: 0,
      couponCode: null,
      paymentStatus: 'PENDING_PAYMENT',
      paymentTokenHash: tokenHash,
      members: {
        create: [
          { position: 1, fullName: 'Tester One', email: `test1_${Date.now()}@test.com`, normalizedEmail: `test1_${Date.now()}@test.com`, phone: '9876543210', normalizedPhone: '9876543210', college: 'Test College' },
          { position: 2, fullName: 'Tester Two', email: `test2_${Date.now()}@test.com`, normalizedEmail: `test2_${Date.now()}@test.com`, phone: '9876543211', normalizedPhone: '9876543211', college: 'Test College' },
          { position: 3, fullName: 'Tester Three', email: `test3_${Date.now()}@test.com`, normalizedEmail: `test3_${Date.now()}@test.com`, phone: '9876543212', normalizedPhone: '9876543212', college: 'Test College' },
        ],
      },
    },
  });

  console.log(`Created test registration: ${testReg.teamId} (${testReg.paymentRef})`);

  // Test 1: Invalid coupon returns generic error
  const invalidResult = await applyCoupon({
    identifier: testReg.teamId,
    paymentToken,
    code: 'wrong_code_xyz',
    ip: '192.168.1.100',
  });
  assert.strictEqual(invalidResult.error, "That code isn't valid.", 'Invalid code gives generic error');
  console.log('✓ Invalid code returns generic error');

  // Test 2: Normalisation works (" Halloween_Night ")
  const validResult = await applyCoupon({
    identifier: testReg.teamId,
    paymentToken,
    code: ' Halloween_Night ',
    ip: '192.168.1.100',
  });
  assert.strictEqual(validResult.ok, true, 'Valid code with spaces and capitals accepted');
  assert.strictEqual(validResult.couponCode, 'halloween_night', 'Code stored normalised');
  assert.strictEqual(validResult.listPrice, 300, 'List price is 300');
  assert.strictEqual(validResult.discountAmount, 180, 'Discount is 180');
  assert.strictEqual(validResult.amount, 120, 'Final amount is 120');
  console.log('✓ Normalisation works (" Halloween_Night " -> 120)');

  // Test 3: Remove coupon returns amount back to 300
  const removeResult = await removeCoupon({
    identifier: testReg.teamId,
    paymentToken,
  });
  assert.strictEqual(removeResult.ok, true, 'Coupon removed');
  assert.strictEqual(removeResult.couponCode, null, 'Coupon code reset to null');
  assert.strictEqual(removeResult.amount, 300, 'Amount reset to 300');
  console.log('✓ Remove coupon resets amount to 300');

  // Re-apply coupon for subsequent tests
  await applyCoupon({
    identifier: testReg.teamId,
    paymentToken,
    code: 'halloween_night',
    ip: '192.168.1.100',
  });

  // Test 4: Submit UTR locks the amount
  const dummyUtr = String(Date.now()).slice(-12);
  const submitResult = await submitPaymentReference({
    registrationId: testReg.id,
    paymentToken,
    utr: dummyUtr,
  });
  assert.strictEqual(submitResult.ok, true, 'UTR submitted successfully');
  console.log('✓ UTR submitted with coupon active');

  // Test 5: Applying coupon AFTER UTR is submitted is refused
  const afterUtrResult = await applyCoupon({
    identifier: testReg.teamId,
    paymentToken,
    code: 'halloween_night',
    ip: '192.168.1.100',
  });
  assert(afterUtrResult.error.includes('locked'), 'Refused coupon change after UTR submitted');
  console.log('✓ Applying coupon after UTR submission is refused');

  // Test 6: Removing coupon AFTER UTR is submitted is refused
  const removeAfterUtr = await removeCoupon({
    identifier: testReg.teamId,
    paymentToken,
  });
  assert(removeAfterUtr.error.includes('locked'), 'Refused coupon removal after UTR submitted');
  console.log('✓ Removing coupon after UTR submission is refused');

  // Test 7: Rate limiting (5 wrong attempts per 10 mins)
  const testIp = '10.0.0.99';
  const rand2 = Math.random().toString(36).slice(2, 8).toUpperCase();
  const paymentToken2 = `test-token-2-${rand2}`;
  const tokenHash2 = createHash('sha256').update(paymentToken2).digest('hex');
  const testReg2 = await prisma.registration.create({
    data: {
      teamName: 'Test Rate Limit Team',
      normalizedTeamName: `test rl team ${Date.now()}`,
      teamId: `TEST-RL-${rand2}`,
      paymentRef: `PAY-RL-${rand2}`,
      amount: 300,
      listPrice: 300,
      paymentStatus: 'PENDING_PAYMENT',
      paymentTokenHash: tokenHash2,
      members: {
        create: [
          { position: 1, fullName: 'RL Tester', email: `rl_${Date.now()}@test.com`, normalizedEmail: `rl_${Date.now()}@test.com`, phone: '9876543299', normalizedPhone: '9876543299', college: 'Test College' },
        ],
      },
    },
  });

  for (let i = 1; i <= 5; i++) {
    const res = await applyCoupon({
      identifier: testReg2.teamId,
      paymentToken: paymentToken2,
      code: `guess_${i}`,
      ip: testIp,
    });
    assert.strictEqual(res.error, "That code isn't valid.", `Attempt ${i} rejected with generic error`);
  }
  // 6th attempt should be blocked by rate limit
  const rateLimitedRes = await applyCoupon({
    identifier: testReg2.teamId,
    paymentToken: paymentToken2,
    code: 'halloween_night', // Even the correct code is blocked once rate limited
    ip: testIp,
  });
  assert.strictEqual(rateLimitedRes.error, "That code isn't valid.", 'Rate limit triggered');
  console.log('✓ 5 wrong codes rate limits subsequent attempts with generic message');

  // Test 8: Mirai coupon rules
  const rand3 = Math.random().toString(36).slice(2, 8).toUpperCase();
  const paymentToken3 = `test-token-3-${rand3}`;
  const tokenHash3 = createHash('sha256').update(paymentToken3).digest('hex');
  const miraiReg = await prisma.registration.create({
    data: {
      teamName: 'Test Mirai Coupon Team',
      normalizedTeamName: `test mirai coupon team ${Date.now()}`,
      teamId: `TEST-MIRAI-${rand3}`,
      paymentRef: `PAY-MIRAI-${rand3}`,
      amount: 300,
      listPrice: 300,
      paymentStatus: 'PENDING_PAYMENT',
      paymentTokenHash: tokenHash3,
      members: {
        create: [
          { position: 1, fullName: 'Mirai Member 1', email: `mirai1_${Date.now()}@test.com`, normalizedEmail: `mirai1_${Date.now()}@test.com`, phone: '9876543231', normalizedPhone: '9876543231', college: 'Mirai School of Technology' },
          { position: 2, fullName: 'Mirai Member 2', email: `mirai2_${Date.now()}@test.com`, normalizedEmail: `mirai2_${Date.now()}@test.com`, phone: '9876543232', normalizedPhone: '9876543232', college: 'Other College' },
          { position: 3, fullName: 'Mirai Member 3', email: `mirai3_${Date.now()}@test.com`, normalizedEmail: `mirai3_${Date.now()}@test.com`, phone: '9876543233', normalizedPhone: '9876543233', college: 'Other College' },
        ],
      },
    },
  });

  // 8a: Mirai team cannot use non-Mirai coupon (halloween_night)
  const miraiInvalidCoupon = await applyCoupon({
    identifier: miraiReg.teamId,
    paymentToken: paymentToken3,
    code: 'halloween_night',
    ip: '192.168.1.105',
  });
  assert.strictEqual(
    miraiInvalidCoupon.error,
    'Only the "last_minute" coupon code is applicable for Mirai School of Technology students.'
  );
  console.log('✓ Mirai team rejected for other coupons');

  // 8b: Mirai team CAN use "last_minute" and gets ₹120 off (final amount ₹180)
  const miraiValidCoupon = await applyCoupon({
    identifier: miraiReg.teamId,
    paymentToken: paymentToken3,
    code: 'last_minute',
    ip: '192.168.1.105',
  });
  assert.strictEqual(miraiValidCoupon.ok, true);
  assert.strictEqual(miraiValidCoupon.couponCode, 'last_minute');
  assert.strictEqual(miraiValidCoupon.discountAmount, 120);
  assert.strictEqual(miraiValidCoupon.amount, 180);
  console.log('✓ Mirai team successfully applies "last_minute" for ₹120 off (total: ₹180)');

  // 8c: Non-Mirai team cannot use "last_minute"
  const rand4 = Math.random().toString(36).slice(2, 8).toUpperCase();
  const paymentToken4 = `test-token-4-${rand4}`;
  const tokenHash4 = createHash('sha256').update(paymentToken4).digest('hex');
  const nonMiraiReg = await prisma.registration.create({
    data: {
      teamName: 'Test Non-Mirai Team',
      normalizedTeamName: `test non-mirai team ${Date.now()}`,
      teamId: `TEST-NONMIRAI-${rand4}`,
      paymentRef: `PAY-NONMIRAI-${rand4}`,
      amount: 300,
      listPrice: 300,
      paymentStatus: 'PENDING_PAYMENT',
      paymentTokenHash: tokenHash4,
      members: {
        create: [
          { position: 1, fullName: 'Other Member', email: `other_${Date.now()}@test.com`, normalizedEmail: `other_${Date.now()}@test.com`, phone: '9876543241', normalizedPhone: '9876543241', college: 'XYZ Institute' },
        ],
      },
    },
  });
  const nonMiraiLastMinute = await applyCoupon({
    identifier: nonMiraiReg.teamId,
    paymentToken: paymentToken4,
    code: 'last_minute',
    ip: '192.168.1.100',
  });
  assert.strictEqual(
    nonMiraiLastMinute.error,
    'The "last_minute" coupon code is applicable for Mirai School of Technology students only.'
  );
  console.log('✓ Non-Mirai team rejected for "last_minute" coupon');

  // Cleanup test registration and rate limits
  await prisma.teamMember.deleteMany({ where: { registrationId: { in: [testReg.id, testReg2.id, miraiReg.id, nonMiraiReg.id] } } });
  await prisma.registration.deleteMany({ where: { id: { in: [testReg.id, testReg2.id, miraiReg.id, nonMiraiReg.id] } } });
  console.log('✓ Test cleanup complete');
  console.log('--- ALL SERVER RULES TESTS PASSED! ---');

  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
