/**
 * This utility helps avoid repetitive try..catch blocks for async Express route handlers
 * @param fn
 * @returns {(function(*, *, *): void)|*}
 */
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;