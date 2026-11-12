/**
 * Serverless API Route: POST /api/enroll
 * 
 * Handles Vulcan Club Enrollment 2026 submissions.
 * Accepts candidate submissions, validates input, and logs or saves to database/sheets.
 */

export default async function handler(req, res) {
  // CORS & Options
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { referenceId, name, classYear, domains, whyJoin } = body;

    // Strict server-side validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Invalid name. At least 2 characters required.' });
    }

    if (classYear !== 'Class of 2029' && classYear !== 'Class of 2030') {
      return res.status(400).json({ error: 'Invalid class year.' });
    }

    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'At least one domain must be selected.' });
    }

    if (!whyJoin || typeof whyJoin !== 'string' || whyJoin.trim().length < 30 || whyJoin.trim().length > 500) {
      return res.status(400).json({ error: 'Statement must be between 30 and 500 characters.' });
    }

    // Log the enrollment in server console
    console.log(`[Vulcan Enrollment 2026] New Applicant: ${name} (${classYear}) for [${domains.join(', ')}] - Ref: ${referenceId}`);

    // If Supabase credentials are configured, sync directly to the Admin Dashboard database
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const normalizedClass = classYear.includes('2030') ? '2030' : '2029';
      const domainMap = { 'Web Dev': 'web_dev', 'DSA': 'dsa', 'PR': 'pr' };
      const normalizedDomains = domains.map((d) => domainMap[d] || d.toLowerCase().replace(/\s+/g, '_'));

      try {
        await fetch(`${supabaseUrl}/rest/v1/enrollment_registrations`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            reference_id: referenceId,
            name: name.trim(),
            class_year: normalizedClass,
            domains: normalizedDomains,
            reason: whyJoin.trim(),
            status: 'new',
            client_meta: { source: 'vulcan_web_3d_form' },
          }),
        });
      } catch (dbErr) {
        console.warn('[Supabase Direct REST Insert Warning]', dbErr);
      }
    }

    return res.status(200).json({
      ok: true,
      referenceId: referenceId || `VLC-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      message: "You're in the fire now. Candidate enrollment registered.",
      receivedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Enrollment API error:', err);
    return res.status(500).json({ error: 'Internal Server Error while recording enrollment.' });
  }
}
