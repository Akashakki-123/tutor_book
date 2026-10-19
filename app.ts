import express, { Express, static as expressStatic, urlencoded, json, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import version1APi from './src/api/v1/index.js';
import { db } from './src/api/v1/config/mongodb.js';
import { badRequest } from './src/api/v1/helpers/response.helper.js';
import { errorHandler } from './src/api/v1/middlewares/error.middleware.js';

const app: Express = express();

//----------use dependencies----------------------------------
app.use(morgan('dev'));

app.use(cors());
app.use('/static', expressStatic('static'));

app.use(urlencoded({ extended: false }));
app.use(json());

app.use(compression());

// -------------- db check--------------------
db();
// -------------- db check--------------------

// API routes (both /v1 prefix and root paths supported)
app.use('/v1', version1APi);
app.use('/', version1APi);

// 404 handler for unhandled URIs
app.use(async (_req: Request, res: Response): Promise<void> => {
  await badRequest(res, 'Invalid URI');
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
