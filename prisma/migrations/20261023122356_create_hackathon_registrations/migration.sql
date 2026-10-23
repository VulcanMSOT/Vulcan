-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "ticketId" VARCHAR(32) NOT NULL,
    "teamName" VARCHAR(40) NOT NULL,
    "normalizedTeamName" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "normalizedEmail" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "normalizedPhone" VARCHAR(10) NOT NULL,
    "college" VARCHAR(80) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationRateLimit" (
    "key" VARCHAR(128) NOT NULL,
    "windowStarted" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Registration_ticketId_key" ON "Registration"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_normalizedTeamName_key" ON "Registration"("normalizedTeamName");

-- CreateIndex
CREATE INDEX "Registration_createdAt_idx" ON "Registration"("createdAt");

-- CreateIndex
CREATE INDEX "Registration_checkedInAt_idx" ON "Registration"("checkedInAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_normalizedEmail_key" ON "TeamMember"("normalizedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_normalizedPhone_key" ON "TeamMember"("normalizedPhone");

-- CreateIndex
CREATE INDEX "TeamMember_college_idx" ON "TeamMember"("college");

-- CreateIndex
CREATE INDEX "TeamMember_registrationId_idx" ON "TeamMember"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_registrationId_position_key" ON "TeamMember"("registrationId", "position");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
