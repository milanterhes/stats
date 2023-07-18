import { Request } from "express";
import { AnyZodObject, ZodError, z } from "zod";
import { UnknownError, ValidationError } from "./errors";

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
