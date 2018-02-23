'use strict';
class BadRequestError extends Error {
  constructor(message, extra) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'BadRequestError';
    this.message = message || 'One or more required parameters are missing from your request.';
    this.extra = extra;
  }
}
module.exports = BadRequestError;