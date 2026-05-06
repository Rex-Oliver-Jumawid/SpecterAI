import { setCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      name: 'Specter API',
      version: '2.0.0',
      runtime: 'vercel-serverless',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
