// src/utils/httpResponse.js
// Netlify Functions don't use Express's (req, res) pattern — each function
// is a plain async (event, context) => response object. This module
// standardizes that response shape so every function returns the same
// clean JSON structure, with CORS headers, regardless of success or
// failure. This is what guarantees "never a blank screen / crash" in the
// serverless world: there is no process to crash, but a function CAN
// throw and Netlify will show a generic 502 with no useful body unless
// we catch everything ourselves and always return a structured response.

const env = require('../config/env');
const { AppError } = require('./errors');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': env.FRONTEND_URL,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function success(data, statusCode = 200, extra = {}) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({ success: true, data, ...extra }),
  };
}

function failure(statusCode, code, message, details = undefined) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: false,
      error: { code, message, details },
    }),
  };
}

/**
 * Wraps a Netlify Function handler so any thrown error — typed AppError or
 * a genuine bug — always returns a clean JSON response with proper CORS
 * headers, never an unhandled crash that surfaces as a blank/broken
 * response to the frontend. Also auto-handles CORS preflight (OPTIONS).
 */
function withErrorHandling(handlerFn) {
  return async (event, context) => {
    // Browsers send an OPTIONS preflight before real cross-origin requests.
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: corsHeaders(), body: '' };
    }

    try {
      return await handlerFn(event, context);
    } catch (err) {
      if (err instanceof AppError) {
        return failure(err.statusCode, err.code, err.message, err.details);
      }
      // Unexpected bug — log full detail server-side (visible in Netlify
      // function logs), but never leak internals to the client.
      console.error('[unhandled function error]', err);
      return failure(
        500,
        'INTERNAL_ERROR',
        'Something went wrong on our end. Please try again shortly.'
      );
    }
  };
}

module.exports = { success, failure, withErrorHandling, corsHeaders };
