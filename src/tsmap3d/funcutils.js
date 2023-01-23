export {assert, notZero, ZeroDivisionError};

function assert(condition, message) {
    if(!condition) {
        throw new Error(message || "Assertion failed")
    }
}

class ZeroDivisionError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
    }
}

function notZero(n) {
    n = +n;  // Coerce to number.
    if (!n) {  // Matches +0, -0, NaN
        throw new ZeroDivisionError();
    }
    return n;
}
