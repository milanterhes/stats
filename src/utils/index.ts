import { Request } from "express";
import { AnyZodObject, ZodError, z } from "zod";
import winston from "winston";

export class BaseError extends Error {
  status: number;
  constructor(message: string, status: number, originalError?: unknown) {
    super(message);
    this.name = "BaseError";
    this.status = status;

    logger.error(message);
    if (originalError) {
      logger.error(originalError);
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

export async function zParseRequest<T extends AnyZodObject>(
  schema: T,
  req: Request
): Promise<z.infer<T>> {
  try {
    return schema.parse(req);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Invalid request", 400, error);
    }
    throw new UnknownError(JSON.stringify(error), 500);
  }
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    // new winston.transports.File({ filename: "error.log", level: "error" }),
    // new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
