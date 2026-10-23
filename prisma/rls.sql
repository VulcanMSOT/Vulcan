-- The public Supabase Data API must never expose hackathon registration data.
-- Serverless handlers connect as the database owner via Prisma; browser clients
-- receive only the narrow ticket response produced by those handlers.
ALTER TABLE "Registration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RegistrationRateLimit" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "Registration", "TeamMember", "RegistrationRateLimit" FROM anon, authenticated;

-- No public policies are intentionally created. Access is server-side only.
