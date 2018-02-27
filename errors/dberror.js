'use strict';
class DbError extends Error {
    constructor(message, extra) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = 'DbError';
        this.message = message || 'Some error happened during the db actions.';
        this.extra = extra;
    }
}
module.exports = DbError;