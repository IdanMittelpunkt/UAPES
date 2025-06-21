import { ForbiddenCustomError, NotFoundCustomError, ValidationCustomError } from '../errors/customErrors.js';
import { Error as MongooseError }  from 'mongoose';
const { ValidationError } = MongooseError;

/*
  Convert errors thrown from the Service layer to the way the controller layer should present them
 */
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationCustomError) { // custom validation error
    return res.status(400).json();
  }
  if (err instanceof ValidationError) { // mongoose's
    return res.status(400).json();
  }
  if (err instanceof ForbiddenCustomError) {
    return res.status(403).json();
  }
  if (err instanceof NotFoundCustomError) {
    return res.status(404).json();
  }

  res.status(500).json();
}