-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_REVIEW', 'PAID', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "paymentApprovedAt" TIMESTAMP(3),
ADD COLUMN "paymentApprovedBy" VARCHAR(100),
ADD COLUMN "paymentNote" VARCHAR(500),
ADD COLUMN "paymentReference" VARCHAR(100),
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
ADD COLUMN "paymentSubmittedAt" TIMESTAMP(3),
ADD COLUMN "paymentTokenHash" VARCHAR(64),
ALTER COLUMN "ticketId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Registration_paymentReference_key" ON "Registration"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_paymentTokenHash_key" ON "Registration"("paymentTokenHash");

-- CreateIndex
CREATE INDEX "Registration_paymentStatus_createdAt_idx" ON "Registration"("paymentStatus", "createdAt");
