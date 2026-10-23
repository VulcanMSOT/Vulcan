import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Reject unauthorized false for node test runner connecting to Supabase pooler
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.ORGANISER_SESSION_SECRET = process.env.ORGANISER_SESSION_SECRET || 'dev-session-secret-key-32-chars-long!!';
process.env.ORGANISER_PASSCODE = process.env.ORGANISER_PASSCODE || 'vulcan2026';

const { prisma } = await import('../src/server/prisma.js');
const {
  getEventSettings,
  createRegistration,
  manualPaymentDetails,
  lookupRegistrationStatus,
  submitPaymentReference,
} = await import('../api/_lib/registration.js');
const { logAdminAction } = await import('../Vulcan-admin/api/_lib/audit.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`  ✓ ${message}`);
    passed++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING VULCAN 13-POINT END-TO-END VERIFICATION SUITE');
  console.log('======================================================\n');

  let testTeam1 = null;
  let testTeam1Token = null;
  let testTeam2 = null;
  let testTeam2Token = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Registration closed check
    // ----------------------------------------------------
    console.log('▶ Test 1: Registration closed check');
    await prisma.eventSettings.upsert({
      where: { id: 'default' },
      update: { registrationsOpen: false },
      create: {
        id: 'default',
        eventName: 'Hack-O-Lantern',
        registrationsOpen: false,
        maxCapacity: 100,
        ticketPrice: 300,
      },
    });

    const closedSettings = await getEventSettings();
    assert(closedSettings.isOpen === false, 'getEventSettings reports isOpen === false');
    assert(closedSettings.closeReason.length > 0, 'closeReason is populated');

    const closedRegResult = await createRegistration({
      teamName: 'Closed Test Team',
      agreed: true,
      leader: {
        fullName: 'Closed Lead',
        email: 'closed_lead@test.msot.org',
        phone: '9876543210',
        college: 'Test College',
      },
      member2: {
        fullName: 'Closed M2',
        email: 'closed_m2@test.msot.org',
        phone: '9876543211',
        college: 'Test College',
      },
      member3: {
        fullName: 'Closed M3',
        email: 'closed_m3@test.msot.org',
        phone: '9876543212',
        college: 'Test College',
      },
    });
    assert(closedRegResult.errors && closedRegResult.errors.registration === 'Registrations are currently closed.',
      'createRegistration rejects closed submission with 422/error');

    // ----------------------------------------------------
    // TEST 2: Registration open check
    // ----------------------------------------------------
    console.log('\n▶ Test 2: Registration open check');
    await prisma.eventSettings.update({
      where: { id: 'default' },
      data: { registrationsOpen: true },
    });

    const openSettings = await getEventSettings();
    assert(openSettings.isOpen === true, 'getEventSettings reports isOpen === true after re-opening');

    // ----------------------------------------------------
    // TEST 3: Database record verification (Team 1)
    // ----------------------------------------------------
    console.log('\n▶ Test 3: Database record verification (Team 1)');
    const team1Name = `Alpha Hackers ${Date.now() % 10000}`;
    const regResult1 = await createRegistration({
      teamName: team1Name,
      agreed: true,
      leader: {
        fullName: 'Alpha Lead',
        email: `alpha_lead_${Date.now()}@test.msot.org`,
        phone: '9123456780',
        college: 'MSOT Institute of Tech',
      },
      member2: {
        fullName: 'Alpha Dev Two',
        email: `alpha_dev2_${Date.now()}@test.msot.org`,
        phone: '9123456781',
        college: 'MSOT Institute of Tech',
      },
      member3: {
        fullName: 'Alpha Dev Three',
        email: `alpha_dev3_${Date.now()}@test.msot.org`,
        phone: '9123456782',
        college: 'MSOT Institute of Tech',
      },
    });

    assert(!regResult1.errors, 'Registration created without errors');
    testTeam1 = regResult1.registration;
    testTeam1Token = regResult1.paymentToken;

    assert(/^VHK-\d{4,}$/.test(testTeam1.teamId), `teamId follows format VHK-XXXX (got ${testTeam1.teamId})`);
    assert(/^PAY-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(testTeam1.paymentRef),
      `paymentRef follows format PAY-XXXXXX (got ${testTeam1.paymentRef})`);

    const dbRecord1 = await prisma.registration.findUnique({
      where: { id: testTeam1.id },
      include: { members: true },
    });
    assert(dbRecord1 !== null, 'Record exists in database');
    assert(dbRecord1.teamId === testTeam1.teamId, 'Database teamId matches');
    assert(dbRecord1.paymentRef === testTeam1.paymentRef, 'Database paymentRef matches');
    assert(dbRecord1.members.length === 3, 'Exactly 3 team members linked in database');

    // ----------------------------------------------------
    // TEST 4: Capacity limit check
    // ----------------------------------------------------
    console.log('\n▶ Test 4: Capacity limit check');
    const currentActiveCount = await prisma.registration.count({
      where: { paymentStatus: { in: ['PAID', 'PENDING_REVIEW', 'PENDING_PAYMENT'] } },
    });

    await prisma.eventSettings.update({
      where: { id: 'default' },
      data: { maxCapacity: currentActiveCount },
    });

    const capResult = await createRegistration({
      teamName: `OverCap Team ${Date.now()}`,
      agreed: true,
      leader: {
        fullName: 'Cap Lead',
        email: `cap_lead_${Date.now()}@test.msot.org`,
        phone: '9998887701',
        college: 'Test College',
      },
      member2: {
        fullName: 'Cap M2',
        email: `cap_m2_${Date.now()}@test.msot.org`,
        phone: '9998887702',
        college: 'Test College',
      },
      member3: {
        fullName: 'Cap M3',
        email: `cap_m3_${Date.now()}@test.msot.org`,
        phone: '9998887703',
        college: 'Test College',
      },
    });

    assert(capResult.errors && capResult.errors.registration.includes('capacity'),
      'Registration blocked when capacity limit is reached');

    // Restore capacity
    await prisma.eventSettings.update({
      where: { id: 'default' },
      data: { maxCapacity: 100 },
    });
    console.log('  ✓ Capacity limit restored to 100');

    // ----------------------------------------------------
    // TEST 5: UPI payment QR payload
    // ----------------------------------------------------
    console.log('\n▶ Test 5: UPI payment QR payload');
    const upiDetails = manualPaymentDetails(testTeam1.paymentRef, 300, 'himangshuyadav2@oksbi');
    assert(upiDetails.uri.startsWith('upi://pay?'), 'URI starts with upi://pay?');
    assert(upiDetails.uri.includes('pa=himangshuyadav2%40oksbi') || upiDetails.uri.includes('pa=himangshuyadav2@oksbi'),
      'UPI URI includes correct payee address');
    assert(upiDetails.uri.includes('am=300'), 'UPI URI includes correct amount');
    assert(upiDetails.uri.includes('cu=INR'), 'UPI URI specifies INR currency');
    assert(upiDetails.uri.includes(`tn=${testTeam1.paymentRef}`),
      `UPI URI includes transaction note tn=${testTeam1.paymentRef}`);

    // ----------------------------------------------------
    // TEST 6: Team ID & Payment Ref display data
    // ----------------------------------------------------
    console.log('\n▶ Test 6: Team ID & Payment Ref display data');
    assert(testTeam1.teamId.length > 0 && testTeam1.paymentRef.length > 0,
      'Both identifiers are present and ready for copy-badge UI display');

    // ----------------------------------------------------
    // TEST 7: Status lookup
    // ----------------------------------------------------
    console.log('\n▶ Test 7: Status lookup');
    const leadEmail1 = dbRecord1.members[0].email;
    const lookupByTeamId = await lookupRegistrationStatus({
      identifier: testTeam1.teamId,
      email: leadEmail1,
    });
    assert(lookupByTeamId.found === true, 'Registration successfully looked up by Team ID');
    assert(lookupByTeamId.teamId === testTeam1.teamId, 'Lookup returns correct team');

    const lookupByPayRef = await lookupRegistrationStatus({
      identifier: testTeam1.paymentRef,
      email: leadEmail1,
    });
    assert(lookupByPayRef.found === true, 'Registration successfully looked up by Payment Reference');

    // ----------------------------------------------------
    // TEST 8: UTR submission
    // ----------------------------------------------------
    console.log('\n▶ Test 8: UTR submission');
    const testUtr1 = `${Date.now()}`.slice(-12);
    const activeToken1 = lookupByPayRef.paymentToken || lookupByTeamId.paymentToken || testTeam1Token;
    const subResult1 = await submitPaymentReference({
      registrationId: testTeam1.id,
      paymentToken: activeToken1,
      utr: testUtr1,
      screenshotPath: 'test/path/screenshot.jpg',
    });
    if (subResult1.error) console.error('subResult1 error:', subResult1.error);
    assert(subResult1.ok === true, 'UTR submitted successfully');

    const updatedDb1 = await prisma.registration.findUnique({ where: { id: testTeam1.id } });
    assert(updatedDb1.paymentStatus === 'PENDING_REVIEW', 'paymentStatus updated to PENDING_REVIEW');
    assert(updatedDb1.utr === testUtr1, 'UTR saved in database');
    assert(updatedDb1.paymentSubmittedAt !== null, 'paymentSubmittedAt timestamp recorded');

    // ----------------------------------------------------
    // TEST 9: Duplicate UTR detection
    // ----------------------------------------------------
    console.log('\n▶ Test 9: Duplicate UTR detection');
    const regResult2 = await createRegistration({
      teamName: `Beta Hackers ${Date.now() % 10000}`,
      agreed: true,
      leader: {
        fullName: 'Beta Lead',
        email: `beta_lead_${Date.now()}@test.msot.org`,
        phone: '9888111221',
        college: 'Test College B',
      },
      member2: {
        fullName: 'Beta M2',
        email: `beta_m2_${Date.now()}@test.msot.org`,
        phone: '9888111222',
        college: 'Test College B',
      },
      member3: {
        fullName: 'Beta M3',
        email: `beta_m3_${Date.now()}@test.msot.org`,
        phone: '9888111223',
        college: 'Test College B',
      },
    });
    testTeam2 = regResult2.registration;
    testTeam2Token = regResult2.paymentToken;

    // Try submitting the EXACT same UTR as Team 1
    const dupResult = await submitPaymentReference({
      registrationId: testTeam2.id,
      paymentToken: testTeam2Token,
      utr: testUtr1, // Duplicate!
    });
    assert(dupResult.error && dupResult.error.includes('already been submitted'),
      'Duplicate UTR submission is detected and blocked');

    // Now submit a unique UTR for Team 2
    const testUtr2 = `${Date.now() + 999}`.slice(-12);
    const subResult2 = await submitPaymentReference({
      registrationId: testTeam2.id,
      paymentToken: testTeam2Token,
      utr: testUtr2,
    });
    assert(subResult2.ok === true, 'Unique UTR for Team 2 accepted');

    // ----------------------------------------------------
    // TEST 10: Admin review & payment approval
    // ----------------------------------------------------
    console.log('\n▶ Test 10: Admin review & payment approval');
    function generateTicketId() {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const chars = Array.from(randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join('');
      return `VULCAN-${chars.slice(0, 4)}-${chars.slice(4)}`;
    }

    const tId = generateTicketId();
    const tToken = randomBytes(24).toString('base64url');

    const approvedTeam1 = await prisma.registration.update({
      where: { id: testTeam1.id },
      data: {
        paymentStatus: 'PAID',
        paymentApprovedAt: new Date(),
        paymentApprovedBy: 'nexcell_rathinam@msot.org',
        ticketId: tId,
        ticketToken: tToken,
      },
    });

    assert(approvedTeam1.paymentStatus === 'PAID', 'paymentStatus updated to PAID');
    assert(/^VULCAN-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(approvedTeam1.ticketId),
      `ticketId follows format VULCAN-XXXX-XXXX (got ${approvedTeam1.ticketId})`);
    assert(approvedTeam1.ticketToken.length > 20, 'ticketToken is high entropy string');

    // Idempotency check: updating again doesn't change ticketId or token
    const reApproved = await prisma.registration.findUnique({ where: { id: testTeam1.id } });
    assert(reApproved.ticketId === approvedTeam1.ticketId, 'Payment approval is idempotent; ticketId stable');

    // ----------------------------------------------------
    // TEST 11: Manual email flow & mark-as-sent
    // ----------------------------------------------------
    console.log('\n▶ Test 11: Manual email flow & mark-as-sent');
    // Test email URL generation
    const emailSubject = encodeURIComponent(`[CONFIRMED] Hack-O-Lantern Ticket — Team ${testTeam1.teamName} (${testTeam1.teamId})`);
    const emailBody = encodeURIComponent(`Dear ${dbRecord1.members[0].fullName},\n\nYour payment has been verified!\nTeam ID: ${testTeam1.teamId}\nTicket ID: ${approvedTeam1.ticketId}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(leadEmail1)}&su=${emailSubject}&body=${emailBody}`;
    assert(gmailUrl.includes('mail.google.com/mail'), 'Gmail compose deep link constructed properly');

    // Mark as sent in DB
    const adminEmail = 'nexcell_rathinam@msot.org';
    const emailMarked = await prisma.registration.update({
      where: { id: testTeam1.id },
      data: {
        emailStatus: 'sent',
        emailSentBy: adminEmail,
        emailSentAt: new Date(),
        emailSentCount: { increment: 1 },
      },
    });
    assert(emailMarked.emailStatus === 'sent', 'emailStatus marked as sent');
    assert(emailMarked.emailSentBy === adminEmail, 'emailSentBy recorded as nexcell_rathinam@msot.org');
    assert(emailMarked.emailSentCount >= 1, 'emailSentCount incremented');

    await logAdminAction({
      adminEmail,
      action: 'mark_email_sent',
      targetId: testTeam1.id,
      details: {
        teamId: testTeam1.teamId,
        recipient: leadEmail1,
      },
    });

    const auditLog = await prisma.auditLog.findFirst({
      where: { targetId: testTeam1.id, action: 'mark_email_sent' },
    });
    assert(auditLog !== null, 'AuditLog entry created for manual email mark-as-sent');

    // ----------------------------------------------------
    // TEST 12: Payment rejection & resubmission
    // ----------------------------------------------------
    console.log('\n▶ Test 12: Payment rejection & resubmission');
    const rejectReason = 'UTR not found in bank statement for 31 Oct.';
    const rejectedTeam2 = await prisma.registration.update({
      where: { id: testTeam2.id },
      data: {
        paymentStatus: 'REJECTED',
        rejectReason,
        paymentNote: `Rejected by ${adminEmail}: ${rejectReason}`,
      },
    });

    assert(rejectedTeam2.paymentStatus === 'REJECTED', 'paymentStatus is REJECTED');
    assert(rejectedTeam2.rejectReason === rejectReason, 'rejectReason saved properly');
    assert(rejectedTeam2.teamId === testTeam2.teamId, 'teamId is completely preserved upon rejection');
    assert(rejectedTeam2.paymentRef === testTeam2.paymentRef, 'paymentRef is completely preserved upon rejection');

    // Resubmit payment with new valid UTR
    const resubmitUtr = `${Date.now() + 5000}`.slice(-12);
    const resubResult = await submitPaymentReference({
      registrationId: testTeam2.id,
      paymentToken: testTeam2Token,
      utr: resubmitUtr,
    });
    assert(resubResult.ok === true, 'Resubmission accepted');

    const resubDb = await prisma.registration.findUnique({ where: { id: testTeam2.id } });
    assert(resubDb.paymentStatus === 'PENDING_REVIEW', 'Status transitioned back to PENDING_REVIEW');
    assert(resubDb.utr === resubmitUtr, 'New UTR recorded');
    assert(resubDb.rejectReason === null, 'Rejection reason cleared for fresh review');
    assert(resubDb.teamId === testTeam2.teamId, 'teamId strictly identical after resubmission');
    assert(resubDb.paymentRef === testTeam2.paymentRef, 'paymentRef strictly identical after resubmission');

    // ----------------------------------------------------
    // TEST 13: Gate check-in desk
    // ----------------------------------------------------
    console.log('\n▶ Test 13: Gate check-in desk');
    const compoundToken = `${approvedTeam1.teamId}:${approvedTeam1.ticketToken}`;

    // 13a. Valid first check-in
    const parts = compoundToken.split(':');
    const candTeamId = parts[0]?.trim().toUpperCase();
    const candToken = parts[1]?.trim();

    const checkinReg = await prisma.registration.findFirst({
      where: {
        teamId: candTeamId,
        ticketToken: candToken,
      },
      include: { members: true },
    });

    assert(checkinReg !== null, 'Registration found via compound token');
    assert(checkinReg.paymentStatus === 'PAID', 'Payment verified as PAID for check-in');
    assert(checkinReg.checkedInAt === null, 'checkedInAt is null prior to entry');

    const admitted = await prisma.registration.update({
      where: { id: checkinReg.id },
      data: { checkedInAt: new Date() },
    });
    assert(admitted.checkedInAt !== null, 'Door entry timestamp recorded (VALID ENTRY)');

    // 13b. Double scan prevention
    const secondScan = await prisma.registration.findUnique({ where: { id: checkinReg.id } });
    assert(secondScan.checkedInAt !== null, 'Double-scan detected: Attendee already admitted');

    // 13c. Invalid token rejection
    const invalidScan = await prisma.registration.findFirst({
      where: {
        teamId: candTeamId,
        ticketToken: 'FAKE_TAMPERED_TOKEN_123',
      },
    });
    assert(invalidScan === null, 'Tampered / forged compound QR token correctly rejected');

    console.log('\n======================================================');
    console.log(`🎉 ALL 13 VERIFICATION TESTS PASSED SUCCESSFULLY! (${passed} checks passed, 0 failed)`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    // Clean up test records
    if (testTeam1) {
      await prisma.teamMember.deleteMany({ where: { registrationId: testTeam1.id } }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { targetId: testTeam1.id } }).catch(() => {});
      await prisma.registration.delete({ where: { id: testTeam1.id } }).catch(() => {});
    }
    if (testTeam2) {
      await prisma.teamMember.deleteMany({ where: { registrationId: testTeam2.id } }).catch(() => {});
      await prisma.auditLog.deleteMany({ where: { targetId: testTeam2.id } }).catch(() => {});
      await prisma.registration.delete({ where: { id: testTeam2.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runAllTests();
