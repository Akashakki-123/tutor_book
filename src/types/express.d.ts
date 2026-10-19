import { JwtUserPayload } from '../api/v1/types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export {};

