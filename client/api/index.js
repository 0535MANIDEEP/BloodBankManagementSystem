/**
 * Vercel Serverless Function — BloodBank full backend.
 * Wraps the Express app using createRequire for CommonJS compatibility.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const app = require('../../server/app');

export default function handler(req, res) {
  return app(req, res);
}
