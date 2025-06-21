// User is trying to access an object that exists, but she doesn't have access to
class ForbiddenCustomError extends Error {}

// User is trying to access an object that does not exist
class NotFoundCustomError extends Error {}

// User is providing an object that does not conform to its schema
class ValidationCustomError extends Error {}

// User is trying to delete a rule when it's the last rule of a policy
class ConflictCustomError extends Error {}

export { ForbiddenCustomError, NotFoundCustomError, ValidationCustomError, ConflictCustomError };