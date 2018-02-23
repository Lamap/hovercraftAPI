'use strict';
class ForbiddenError extends Error {
  constructor(message, extra) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'ForbiddenError';
    this.message = message || 'You do not have permission to access this API endpoint.';
    this.extra = extra;
  }
}
module.exports = ForbiddenError;