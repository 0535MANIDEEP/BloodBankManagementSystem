/**
 * Vercel Serverless Function entry point.
 * Wraps the Express app for Vercel's serverless infrastructure.
 */

const app = require('../server/app');

// For Vercel serverless: export as a named handler
module.exports = (req, res) => app(req, res);
