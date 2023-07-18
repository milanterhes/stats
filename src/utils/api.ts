import {
  EndpointsFactory,
  IOSchema,
  createResultHandler,
  getExamples,
  getMessageFromError,
  getStatusCodeFromError,
  withMeta,
} from "express-zod-api";
import { z } from "zod";
import { BaseError } from "./errors";

// this is based on the default result handler, but with BaseError check
const resultHandler = createResultHandler({
  getPositiveResponse: (output: IOSchema) => {
    const examples = getExamples({ schema: output });
    const responseSchema = withMeta(
      z.object({
        status: z.literal("success"),
        data: output,
      })
    );
    return examples.reduce<typeof responseSchema>(
      (acc, example) =>
        acc.example({
          status: "success",
          data: example,
        }),
      responseSchema
    );
  },
  getNegativeResponse: () =>
    withMeta(
      z.object({
        status: z.literal("error"),
        error: z.object({
          message: z.string(),
        }),
      })
    ).example({
      status: "error",
      error: {
        message: getMessageFromError(new Error("Sample error message")),
      },
    }),
  handler: ({ error, input, output, request, response, logger }) => {
    if (!error) {
      response.status(200).json({
        status: "success" as const,
        data: output,
      });
      return;
    }
    if (error instanceof BaseError) {
      response.status(error.status).json({
        status: "error" as const,
        error: { message: error.message },
      });
      return;
    }
    const statusCode = getStatusCodeFromError(error);
    if (statusCode === 500) {
      logger.error(`Internal server error\n${error.stack}\n`, {
        url: request.url,
        payload: input,
      });
    }
    response.status(statusCode).json({
      status: "error" as const,
      error: { message: getMessageFromError(error) },
    });
  },
});

export const endpointFactory = new EndpointsFactory(resultHandler);
