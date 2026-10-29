import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { prisma } from '../src/server/prisma.js';
import { validateRegistration, createRegistration } from '../api/_lib/registration.js';
import { applyCoupon } from '../api/_lib/coupons.js';

async function run() {
  console.log('--- Starting 2-Member & 3-Member Registration Tests ---');

  // Test 1: Team of 2 (Leader + Member 2 only, no Member 3)
  console.log('\n[Test 1] Validating team of 2 members (no Member 3 provided)...');
  const twoMemberInput = {
    teamName: `Two Squad ${Date.now()}`,
    agreed: true,
    leader: {
      fullName: 'Alice Leader',
      email: `alice_${Date.now()}@test.com`,
      phone: '9876543210',
      college: 'Test Tech Institute',
    },
    member2: {
      fullName: 'Bob Partner',
      email: `bob_${Date.now()}@test.com`,
      phone: '9876543211',
      college: 'Test Tech Institute',
    },
    member3: {
      fullName: '',
      email: '',
      phone: '',
      college: '',
    },
  };

  const val2 = validateRegistration(twoMemberInput);
  if (Object.keys(val2.errors).length > 0) {
    throw new Error(`Expected 0 validation errors for 2-member team, got: ${JSON.stringify(val2.errors)}`);
  }
  if (val2.members.length !== 2) {
    throw new Error(`Expected 2 members in validated payload, got ${val2.members.length}`);
  }
  console.log('✓ Validation passed for team of 2 with 0 errors and exactly 2 members.');

  // Test 2: Incomplete team of 1 (Member 2 missing) must fail
  console.log('\n[Test 2] Validating team with missing Member 2 (solo team)...');
  const soloInput = {
    teamName: `Solo Squad ${Date.now()}`,
    agreed: true,
    leader: {
      fullName: 'Solo Leader',
      email: `solo_${Date.now()}@test.com`,
      phone: '9876543210',
      college: 'Test Tech Institute',
    },
    member2: {
      fullName: '',
      email: '',
      phone: '',
      college: '',
    },
  };
  const valSolo = validateRegistration(soloInput);
  if (!valSolo.errors['member2.fullName'] || !valSolo.errors['member2.email']) {
    throw new Error(`Expected errors for missing Member 2, got: ${JSON.stringify(valSolo.errors)}`);
  }
  console.log('✓ Validation correctly enforced Member 2 requirement for solo team.');

  // Test 3: Partially filled Member 3 must fail validation for missing fields
  console.log('\n[Test 3] Validating partially filled Member 3...');
  const partial3Input = {
    ...twoMemberInput,
    teamName: `Partial 3 Squad ${Date.now()}`,
    member3: {
      fullName: 'Charlie Extra',
      email: '', // missing
      phone: '',
      college: '',
    },
  };
  const valPartial3 = validateRegistration(partial3Input);
  if (!valPartial3.errors['member3.email'] || !valPartial3.errors['member3.phone']) {
    throw new Error(`Expected errors for partial Member 3, got: ${JSON.stringify(valPartial3.errors)}`);
  }
  console.log('✓ Partial Member 3 correctly required all member fields.');

  // Test 4: Fully filled Member 3 produces 3 members
  console.log('\n[Test 4] Validating full team of 3 members...');
  const threeMemberInput = {
    ...twoMemberInput,
    teamName: `Three Squad ${Date.now()}`,
    member3: {
      fullName: 'Charlie Full',
      email: `charlie_${Date.now()}@test.com`,
      phone: '9876543212',
      college: 'Test Tech Institute',
    },
  };
  const val3 = validateRegistration(threeMemberInput);
  if (Object.keys(val3.errors).length > 0) {
    throw new Error(`Expected 0 validation errors for 3-member team, got: ${JSON.stringify(val3.errors)}`);
  }
  if (val3.members.length !== 3) {
    throw new Error(`Expected 3 members in validated payload, got ${val3.members.length}`);
  }
  console.log('✓ Validation passed for team of 3 with 0 errors and exactly 3 members.');

  // Test 5: End-to-end DB registration of a team of 2
  console.log('\n[Test 5] Creating team of 2 in database via createRegistration()...');
  const createResult = await createRegistration(twoMemberInput);
  if (createResult.errors) {
    throw new Error(`Failed to create team of 2: ${JSON.stringify(createResult.errors)}`);
  }
  const regId = createResult.registration.id;
  const paymentToken = createResult.paymentToken;
  console.log('✓ Team of 2 created in DB with ID:', createResult.registration.teamId);

  // Verify DB record
  const savedReg = await prisma.registration.findUnique({
    where: { id: regId },
    include: { members: { orderBy: { position: 'asc' } } },
  });
  if (!savedReg) throw new Error('Registration record not found in DB!');
  if (savedReg.members.length !== 2) {
    throw new Error(`Expected 2 member rows in DB, found ${savedReg.members.length}`);
  }
  if (savedReg.members[0].position !== 1 || savedReg.members[1].position !== 2) {
    throw new Error(`Member positions incorrect: ${JSON.stringify(savedReg.members.map((m) => m.position))}`);
  }
  console.log('✓ Verified 2 members stored with positions 1 and 2.');

  // Test 6: Team of 2 applying coupon
  console.log('\n[Test 6] Applying coupon to 2-member team...');
  const couponResult = await applyCoupon({
    identifier: savedReg.teamId,
    paymentToken,
    code: 'halloween_night',
    ip: '127.0.0.1',
  });
  if (couponResult.error) {
    throw new Error(`Failed to apply coupon to 2-member team: ${couponResult.error}`);
  }
  if (couponResult.amount !== 120) {
    throw new Error(`Expected discounted amount 120, got ${couponResult.amount}`);
  }
  console.log(`✓ Coupon applied successfully: amount reduced to ₹${couponResult.amount}`);

  // Test 7: Cleanup
  console.log('\n[Test 7] Cleaning up test records...');
  await prisma.teamMember.deleteMany({ where: { registrationId: regId } });
  await prisma.registration.delete({ where: { id: regId } });
  console.log('✓ Cleaned up test registration.');

  console.log('\n--- ALL 2-MEMBER & 3-MEMBER REGISTRATION TESTS PASSED! ---');
}

run()
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
