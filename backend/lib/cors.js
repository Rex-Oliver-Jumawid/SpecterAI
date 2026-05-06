/**
 * CORS helper for Vercel serverless functions.
 * Call setCors(req, res) at the top of every handler.
 * Returns true if the request was an OPTIONS preflight (already handled).
 *
 * Automatically allows:
 *  - All localhost dev ports
 *  - Any *.vercel.app origin (production + preview deployments)
 *  - Any origins listed in the ALLOWED_ORIGINS env var
 */
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
];

export function setCors(req, res) {
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : [];

  const allowedOrigins = [...DEFAULT_ORIGINS, ...envOrigins];
  const origin = req.headers.origin || '';

  // Check if origin is explicitly listed, is a *.vercel.app URL, or wildcard is set
  const isAllowed =
    allowedOrigins.includes(origin) ||
    allowedOrigins.includes('*') ||
    /^https?:\/\/.*\.vercel\.app$/.test(origin);

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}
