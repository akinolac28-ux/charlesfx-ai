// src/utils/errors.js
// Consistent, typed errors so the error-handling middleware can always
// produce a clean JSON response instead of an unhandled crash.

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // distinguishes "expected" errors from bugs
  }
}

class UpstreamDataError extends AppError {
  constructor(message, details = null) {
    super(message, 502, 'UPSTREAM_DATA_ERROR', details);
    this.name = 'UpstreamDataError';
  }
}

class InvalidRequestError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'INVALID_REQUEST', details);
    this.name = 'InvalidRequestError';
  }
}

class RateLimitedError extends AppError {
  constructor(message = 'Too many requests. Please slow down.') {
    super(message, 429, 'RATE_LIMITED');
    this.name = 'RateLimitedError';
  }
}

class InsufficientDataError extends AppError {
  constructor(message = 'Not enough market data to compute this indicator yet.') {
    super(message, 422, 'INSUFFICIENT_DATA');
    this.name = 'InsufficientDataError';
  }
}

module.exports = {
  AppError,
  UpstreamDataError,
  InvalidRequestError,
  RateLimitedError,
  InsufficientDataError,
};
