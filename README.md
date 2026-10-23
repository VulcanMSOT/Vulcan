# Vulcan MSOT — Hack-O-Lantern & Public Portal

The official web portal and Hack-O-Lantern event registration platform for **Vulcan Club** at MSOT (Modern School of Open Technology).

---

## 1. System Architecture & Features

- **Public Site**: React 18, Vite, Lucide icons, responsive dark-mode event landing page.
- **Backend**: Vercel Serverless Functions (`/api/*`) running Node.js.
- **Database**: Supabase PostgreSQL (shared with `Vulcan-admin`), managed via Prisma ORM.
- **Storage**: Supabase Storage private bucket `payment-screenshots` for upload of UPI payment proof.
- **100% Free Tier Architecture**:
  - Hosted on **Vercel Hobby (Free)**.
  - Database on **Supabase Free Tier**.
  - Client-side manual UPI QR payment (`himangshuyadav2@oksbi`).
  - No paid gateways, no paid email APIs.

### Key Registration Flow:
1. **Dynamic Event Settings**: Reads live capacity, open/closed status, fee, and UPI ID directly from the database (`event_settings`).
2. **Atomic Registration**:
   - Acquires advisory lock on `event_settings` to prevent race conditions when capacity is nearing 100%.
   - Allocates sequential `team_id` (`VHK-1001+`) via a PostgreSQL sequence.
   - Allocates random, unguessable `payment_ref` (`PAY-XXXXXX`) via cryptographically random base-32 generator.
   - Creates `Registration` and `TeamMember` records in a single database transaction.
3. **Client-Side UPI Payment**:
   - Generates dynamic UPI intent QR with `pa=<upi_id>&pn=Vulcan&am=<fee>&cu=INR&tn=<payment_ref>`.
   - Prominently prompts attendees to save both `Team ID` and `Payment Reference`.
4. **Proof Submission**:
   - Attendees submit their 12-digit bank UTR reference number and optional screenshot.
   - Duplicate UTR check blocks fraudulent multiple submissions of the same transaction reference.
5. **Attendee Self-Lookup**:
   - Attendees can return anytime to check status or retrieve their ticket using their `Team ID` (or `Payment Ref`) and team leader email.

---

## 2. Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase PostgreSQL Database (Shared with Vulcan-admin)
# Use transaction pooler (port 6543) for serverless functions, direct (port 5432) for migrations
DATABASE_URL="postgresql://postgres.ryotqaievumejewpdzmr:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.ryotqaievumejewpdzmr:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase Client Credentials
VITE_SUPABASE_URL="https://ryotqaievumejewpdzmr.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Fallbacks for Next.js / React
NEXT_PUBLIC_SUPABASE_URL="https://ryotqaievumejewpdzmr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Fallback UPI Configuration (Overridden dynamically by DB event_settings)
NEXT_PUBLIC_UPI_ID="himangshuyadav2@oksbi"
NEXT_PUBLIC_EVENT_AMOUNT="300"
UPI_VPA="himangshuyadav2@oksbi"
UPI_PAYEE_NAME="Vulcan"

# Cloudflare Turnstile Bot Verification (Optional; bypassed gracefully if left empty)
VITE_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# CORS Origin Allow-list (Comma-separated)
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,https://vulcan-club.vercel.app,https://vulcan-admin.vercel.app"
```

---

## 3. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Start development server
npm run dev
```

---

## 4. Supabase Free Tier Configuration Checklist

1. **Database Tables & Extensions**:
   - Run `npx prisma db push` or apply the SQL migration script from `scripts/apply_migration.js`.
2. **Storage Bucket**:
   - Create bucket: `payment-screenshots`.
   - Set as **Private** (public access disabled).
   - Create RLS policy allowing anonymous inserts:
     ```sql
     CREATE POLICY "Anon uploads" ON storage.objects
       FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');
     ```
3. **Database Inactivity Pause Mitigation**:
   - Supabase free projects pause after 7 days of inactivity.
   - Configure a free HTTP ping (e.g. [UptimeRobot](https://uptimerobot.com) or a scheduled GitHub Action) every 24 hours to `https://vulcan-club.vercel.app/api/event-settings` to keep the database awake and active.

---

## 5. Deployment (Vercel Free Tier)

1. Connect repository to [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build` (runs `prisma generate && vite build`).
4. Output Directory: `dist`.
5. Populate environment variables from `.env.example` in Vercel Project Settings.
