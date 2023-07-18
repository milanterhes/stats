import dotenv from "dotenv";
import express from "express";
import {
  Documentation,
  Routing,
  attachRouting,
  createConfig,
  defaultEndpointsFactory,
} from "express-zod-api";
import swaggerUi from "swagger-ui-express";
import yaml from "yaml";
import { z } from "zod";
import { default as profileStatEndpoint } from "./routes/profile-stats";
import { logger } from "./utils";

dotenv.config();
const port = process.env.PORT ?? 3000;

const app = express();

const helloWorldEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    name: z.string().optional(),
  }),
  output: z.object({
    greetings: z.string(),
  }),
  handler: async ({ input: { name }, options, logger }) => {
    logger.debug("Options:", options);
    return { greetings: `Hello, ${name || "World"}. Happy coding!` };
  },
});

const routing: Routing = {
  hello: helloWorldEndpoint,
  stats: {
    ":platform": {
      ":handle": profileStatEndpoint,
    },
  },
};

const config = createConfig({
  app,
  logger,
  cors: false,
  server: {
    listen: 3000,
  },
});

const yamlString = new Documentation({
  routing,
  config,
  version: "0.0.1",
  title: "Profile Stat API",
  // this should be loaded from the env
  serverUrl: "http://localhost:3000",
  composition: "inline",
}).getSpecAsYaml();

const swaggerDocument = yaml.parse(yamlString);

const { notFoundHandler } = attachRouting(config, routing);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(notFoundHandler);
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
