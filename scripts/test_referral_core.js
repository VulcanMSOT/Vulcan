import assert from 'node:assert';
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';
import { prisma } from '../src/server/prisma.js';
import {
  validateReferralCode,
  applyReferralToRegistration,
  removeReferralFromRegistration,
  checkReferralRateLimit,
  recordFailedReferralAttempt,
  ensureMiraiReferrersForRegistration,
  confirmTeamReferral,
  reverseTeamReferral,
} from '../api/_lib/referral.js';
import { createRegistration, submitPaymentReference } from '../api/_lib/registration.js';
import { applyCoupon } from '../api/_lib/coupons.js';

dotenv.config({ path: '.env.local' });

async function runTests() {
  console.log('--- Starting Referral Core Verification Tests ---');

  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const testIp = `198.51.100.${Math.floor(Math.random() * 200 + 1)}`;

  // Cleanup past test data
  await prisma.referral.deleteMany({
    where: { referredTeam: { teamName: { startsWith: 'Test Ref' } } },
  }).catch(() => {});
  await prisma.referrer.deleteMany({
    where: { email: { contains: 'test_ref_' } },
  }).catch(() => {});
  await prisma.registration.deleteMany({
    where: { OR: [{ teamName: { startsWith: 'Test Ref' } }, { teamName: { startsWith: 'Test Mirai' } }] },
  }).catch(() => {});
  await prisma.registrationRateLimit.deleteMany({
    where: { key: { startsWith: `ref_check:${testIp}` } },
  }).catch(() => {});

  // Test 1: Invalid and unknown codes return identical generic message
  const unknownRes = await validateReferralCode('UNKNOWN123');
  assert.strictEqual(unknownRes.valid, false);
  assert.strictEqual(unknownRes.error, "That referral code isn't valid.");
  console.log('✓ Test 1 Passed: Unknown code returns generic error');

  // Test 2: Rate limit after 5 failed attempts
  for (let i = 0; i < 5; i++) {
    await recordFailedReferralAttempt(testIp);
  }
  const rlRes = await checkReferralRateLimit(testIp);
  assert.strictEqual(rlRes.ok, false);
  assert.strictEqual(rlRes.error, 'Too many attempts. Please try again later.');
  console.log('✓ Test 2 Passed: 5 wrong attempts in a row are rate limited');

  // Test 3: Club member referrer creation and validation
  const clubMemberEmail = `test_ref_club_${rand}@test.com`;
  const clubMember = await prisma.referrer.create({
    data: {
      name: 'Club Alice',
      email: clubMemberEmail,
      phone: '9876543201',
      type: 'club_member',
      code: `ALICE-${rand}`,
      active: true,
    },
  });
  assert.ok(clubMember.id);

  const validCheck = await validateReferralCode(` alice-${rand} `); // test normalization
  assert.strictEqual(validCheck.valid, true);
  assert.strictEqual(validCheck.code, `ALICE-${rand}`);
  console.log('✓ Test 3 Passed: Active referrer validates with whitespace/lowercase normalization');

  // Test 4: Deactivated referrer returns identical generic error
  await prisma.referrer.update({
    where: { id: clubMember.id },
    data: { active: false },
  });
  const deactRes = await validateReferralCode(clubMember.code);
  assert.strictEqual(deactRes.valid, false);
  assert.strictEqual(deactRes.error, "That referral code isn't valid.");
  console.log('✓ Test 4 Passed: Deactivated referrer returns same generic error');

  // Reactivate for further tests
  await prisma.referrer.update({
    where: { id: clubMember.id },
    data: { active: true },
  });

  // Test 5: Self-referral blocked (matching email or phone)
  const selfByEmail = await validateReferralCode(clubMember.code, {
    teamMembers: [
      { fullName: 'Self Person', email: clubMemberEmail, phone: '9123456789' },
      { fullName: 'Member Two', email: `test_m2_${rand}@test.com`, phone: '9123456788' },
      { fullName: 'Member Three', email: `test_m3_${rand}@test.com`, phone: '9123456787' },
    ],
  });
  assert.strictEqual(selfByEmail.valid, false);
  assert.strictEqual(selfByEmail.error, "That referral code isn't valid.");

  const selfByPhone = await validateReferralCode(clubMember.code, {
    teamMembers: [
      { fullName: 'Self Person', email: `different_${rand}@test.com`, phone: '+91 9876543201' },
      { fullName: 'Member Two', email: `test_m2_${rand}@test.com`, phone: '9123456788' },
      { fullName: 'Member Three', email: `test_m3_${rand}@test.com`, phone: '9123456787' },
    ],
  });
  assert.strictEqual(selfByPhone.valid, false);
  assert.strictEqual(selfByPhone.error, "That referral code isn't valid.");
  console.log('✓ Test 5 Passed: Self-referral via email or phone blocked');

  // Test 6: Registration with referral code creates pending referral
  const regRes = await createRegistration({
    teamName: `Test Ref Team ${rand}`,
    referralCode: clubMember.code,
    agreed: true,
    leader: {
      fullName: 'Attendee Leader',
      email: `test_ref_lead_${rand}@test.com`,
      phone: '9876543111',
      college: 'Other College',
    },
    member2: {
      fullName: 'Attendee Two',
      email: `test_ref_m2_${rand}@test.com`,
      phone: '9876543112',
      college: 'Other College',
    },
    member3: {
      fullName: 'Attendee Three',
      email: `test_ref_m3_${rand}@test.com`,
      phone: '9876543113',
      college: 'Other College',
    },
  });

  assert.ok(regRes.registration, 'Team registered successfully');
  assert.strictEqual(regRes.registration.referralCode, clubMember.code);

  const pendingRef = await prisma.referral.findUnique({
    where: { referredTeamId: regRes.registration.id },
  });
  assert.ok(pendingRef, 'Referral record was created');
  assert.strictEqual(pendingRef.status, 'pending');
  assert.strictEqual(pendingRef.referrerId, clubMember.id);
  console.log('✓ Test 6 Passed: Team registered with pending referral');

  // Test 7: Coupon logic and price unaffected
  assert.strictEqual(regRes.registration.amount, 300);
  assert.strictEqual(regRes.registration.listPrice, 300);
  assert.strictEqual(regRes.registration.discountAmount, 0);

  const couponRes = await applyCoupon({
    identifier: regRes.registration.teamId,
    paymentToken: regRes.paymentToken,
    code: 'halloween_night',
  });
  assert.strictEqual(couponRes.ok, true);
  assert.strictEqual(couponRes.amount, 120);
  assert.strictEqual(couponRes.discountAmount, 180);
  console.log('✓ Test 7 Passed: Coupon and price function completely unaffected by referral');

  // Test 8: Code lock after UTR submission
  const utrSubmission = await submitPaymentReference({
    registrationId: regRes.registration.id,
    paymentToken: regRes.paymentToken,
    utr: '123456789012',
  });
  assert.strictEqual(utrSubmission.ok, true);

  const tryChangeRef = await applyReferralToRegistration({
    identifier: regRes.registration.teamId,
    paymentToken: regRes.paymentToken,
    code: clubMember.code,
  });
  assert.strictEqual(tryChangeRef.error, 'Referral code cannot be changed after payment submission.');

  const tryRemoveRef = await removeReferralFromRegistration({
    identifier: regRes.registration.teamId,
    paymentToken: regRes.paymentToken,
  });
  assert.strictEqual(tryRemoveRef.error, 'Referral code cannot be removed after payment submission.');
  console.log('✓ Test 8 Passed: Referral code is locked once UTR is submitted');

  // Test 9: Confirmation and reversal lifecycle
  // 9a: Confirm referral
  const confirmedRef = await confirmTeamReferral(regRes.registration.id);
  assert.strictEqual(confirmedRef.status, 'confirmed');
  assert.ok(confirmedRef.confirmedAt);
  console.log('✓ Test 9a Passed: Payment approval updates referral status to confirmed');

  // 9b: Reverse referral (e.g. rejection or ticket revocation)
  const reversedRef = await reverseTeamReferral(regRes.registration.id);
  assert.strictEqual(reversedRef.status, 'reversed');
  assert.ok(reversedRef.reversedAt);
  console.log('✓ Test 9b Passed: Rejection/revocation reverses the confirmed referral');

  // 9c: Re-confirm restores to confirmed
  const reconfirmedRef = await confirmTeamReferral(regRes.registration.id);
  assert.strictEqual(reconfirmedRef.status, 'confirmed');
  assert.strictEqual(reconfirmedRef.reversedAt, null);
  console.log('✓ Test 9c Passed: Re-confirming restores referral to confirmed');

  // Test 10: Mirai student referral code generated ONLY when team is confirmed
  const miraiLeadEmail = `test_ref_mirai_lead_${rand}@test.com`;
  const p1 = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const p2 = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const p3 = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const miraiReg = await createRegistration({
    teamName: `Test Mirai Team ${rand}`,
    agreed: true,
    leader: {
      fullName: 'Mirai Student Lead',
      email: miraiLeadEmail,
      phone: p1,
      college: 'Mirai School of Technology',
    },
    member2: {
      fullName: 'Non Mirai Member',
      email: `test_other_${rand}@test.com`,
      phone: p2,
      college: 'Other Engineering College',
    },
    member3: {
      fullName: 'Mirai Member Three',
      email: `test_ref_mirai_m3_${rand}@test.com`,
      phone: p3,
      college: 'Mirai School of Technology',
    },
  });

  assert.ok(miraiReg.registration, `Failed to create mirai registration: ${JSON.stringify(miraiReg.errors || miraiReg)}`);
  // Verify before confirmation: Mirai students do NOT have a referrer record
  const checkBefore = await prisma.referrer.findUnique({
    where: { email: miraiLeadEmail.toLowerCase() },
  });
  assert.strictEqual(checkBefore, null, 'Mirai student has no code before payment confirmation');

  // Simulate payment confirmation
  await prisma.registration.update({
    where: { id: miraiReg.registration.id },
    data: { paymentStatus: 'PAID', ticketId: `VULCAN-${rand}` },
  });
  await ensureMiraiReferrersForRegistration(miraiReg.registration.id);

  // Verify after confirmation: Mirai students get active codes with type 'mirai_student'
  const miraiLeadReferrer = await prisma.referrer.findUnique({
    where: { email: miraiLeadEmail.toLowerCase() },
  });
  assert.ok(miraiLeadReferrer, 'Mirai student now has a Referrer record');
  assert.strictEqual(miraiLeadReferrer.type, 'mirai_student');
  assert.strictEqual(miraiLeadReferrer.active, true);
  assert.ok(miraiLeadReferrer.code.includes('-'));

  // Non-Mirai student on the same team does NOT get a code
  const nonMiraiReferrer = await prisma.referrer.findUnique({
    where: { email: `test_other_${rand}@test.com` },
  });
  assert.strictEqual(nonMiraiReferrer, null, 'Non-Mirai member does not get a referral code');
  console.log('✓ Test 10 Passed: Mirai student gets code only after confirmation; non-Mirai members do not');

  // Test 11: Mirai student members cannot use/apply a referral code
  const miraiBlockCheck = await validateReferralCode(clubMember.code, {
    teamMembers: [
      { fullName: 'Mirai User', email: `test_mirai_apply_${rand}@test.com`, phone: '9888877771', college: 'Mirai School of Technology' },
      { fullName: 'User Two', email: `test_m2_apply_${rand}@test.com`, phone: '9888877772', college: 'Other College' },
      { fullName: 'User Three', email: `test_m3_apply_${rand}@test.com`, phone: '9888877773', college: 'Other College' },
    ],
  });
  assert.strictEqual(miraiBlockCheck.valid, false);
  assert.strictEqual(miraiBlockCheck.error, 'Referral codes cannot be applied by Mirai School of Technology students.');

  const miraiRegAttempt = await createRegistration({
    teamName: `Test Block Mirai ${rand}`,
    agreed: true,
    referralCode: clubMember.code,
    leader: {
      fullName: 'Mirai Candidate',
      email: `test_mirai_lead_${rand}@test.com`,
      phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
      college: 'Mirai School of Technology',
    },
    member2: {
      fullName: 'Other Member 2',
      email: `test_other2_${rand}@test.com`,
      phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
      college: 'Other Engineering College',
    },
    member3: {
      fullName: 'Other Member 3',
      email: `test_other3_${rand}@test.com`,
      phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
      college: 'Other Engineering College',
    },
  });
  assert.ok(miraiRegAttempt.errors);
  assert.strictEqual(miraiRegAttempt.errors.referralCode, 'Referral codes cannot be applied by Mirai School of Technology students.');
  console.log('✓ Test 11 Passed: Teams with Mirai School of Technology members are blocked from using referral codes');

  console.log('\n--- ALL REFERRAL CORE TESTS PASSED SUCCESSFULLY ---');
}

runTests()
  .catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
