import { Request } from "express";
import { AnyZodObject, ZodError, z } from "zod";

export class BaseError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "BaseError";
    this.status = status;
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "ValidationError";
  }
}

export class UnknownError extends BaseError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "UnknownError";
  }
}

export class ProfileStatError extends BaseError {
  constructor(message: string, status: number) {
    super(message, status);
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
      throw new ValidationError("Invalid request", 400);
    }
    throw new UnknownError(JSON.stringify(error), 500);
  }
}
