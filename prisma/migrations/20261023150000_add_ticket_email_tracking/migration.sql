ALTER TABLE "Registration"
  ADD COLUMN "ticketEmailSentAt" TIMESTAMP(3),
  ADD COLUMN "ticketEmailError" VARCHAR(500),
  ADD COLUMN "ticketEmailId" VARCHAR(100);
