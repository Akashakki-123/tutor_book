import express, { Express, static as expressStatic, urlencoded, json, Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import version1APi from "./src/api/v1/index.js";
import { db } from "./src/api/v1/config/mongodb.js";
import { badRequest } from "./src/api/v1/helpers/response.helper.js";
import { errorHandler } from "./src/api/v1/middlewares/error.middleware.js";

const app: Express = express();

app.use(morgan("dev"));
app.use(cors());
app.use("/static", expressStatic("static"));
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(compression());

db();

app.use("/v1", version1APi);
app.use("/", version1APi);

app.use(async (_req: Request, res: Response): Promise<void> => {
  await badRequest(res, "Invalid URI");
});

app.use(errorHandler);

export default app;
