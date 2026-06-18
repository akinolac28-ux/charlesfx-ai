// src/config/env.js
// In Netlify, environment variables are set in the Netlify dashboard
// (Site settings → Environment variables) or via `netlify env:set` CLI —
// NOT in a committed .env file. For local testing with `netlify dev`,
// Netlify CLI automatically reads a local .env file for you, so dotenv
// is only needed for that local-dev convenience, never in production.

if (process.env.NETLIFY_DEV || process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch {
    // dotenv not installed in production deps — fine, Netlify injects
    // real env vars directly there anyway.
  }
}

function maskedKeyPreview(key) {
  if (!key) return '(not set)';
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

const env = {
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
  FINNHUB_BASE_URL: process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || '*',
};

console.log('[config] FINNHUB_API_KEY:', maskedKeyPreview(env.FINNHUB_API_KEY));

module.exports = env;
