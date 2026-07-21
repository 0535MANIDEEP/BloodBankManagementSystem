/**
 * Vercel Serverless Function - BloodBank health check.
 * The full backend requires MongoDB and can't run on Vercel serverless.
 * This endpoint confirms the deployment is live.
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    status: 'ok',
    service: 'bloodbank-management-system',
    message: 'Frontend is live. Backend requires MongoDB connection.',
    timestamp: new Date().toISOString(),
  });
}
