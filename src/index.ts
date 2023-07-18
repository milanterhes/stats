import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { default as profileRouter } from "./routes/profile-stats";
import { BaseError } from "./utils";

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/stats", profileRouter);

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof BaseError) {
    return res.status(err.status).send(err.message);
  }
  res.status(500).send("Something went wrong!");
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
