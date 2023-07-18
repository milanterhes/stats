import { logger } from "./logger";

export class BaseError extends Error {
  status: number;
  constructor(message: string, status: number, originalError?: unknown) {
    super(message);
    this.name = "BaseError";
    this.status = status;

    logger.error(message);
    if (originalError) {
      logger.error(JSON.stringify(originalError));
    }
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, status: number, originalError?: unknown) {
    super(message, status, originalError);
    this.name = "ValidationError";
  }
}

export class UnknownError extends BaseError {
  constructor(message: string, status: number, originalError?: unknown) {
    super(message, status, originalError);
    this.name = "UnknownError";
  }
}

export class ProfileStatError extends BaseError {
  constructor(message: string, status: number, originalError?: unknown) {
    super(message, status, originalError);
    this.name = "ProfileStatError";
  }
}
