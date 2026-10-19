import { Router } from 'express';
import {
  saveSession,
  getAvailableSessionsList,
  bookUserSession,
  completeSession,
} from '../controllers/session.controller.js';

const sessionRoutes = Router();

// API 2: POST /sessions
sessionRoutes.post('/', saveSession);

// API 3: GET /sessions/available?dateTimestamp={timestamp}
sessionRoutes.get('/available', getAvailableSessionsList);

// API 4: POST /sessions/:id/book
sessionRoutes.post('/:id/book', bookUserSession);

// API 5: PATCH /sessions/:id/complete
sessionRoutes.patch('/:id/complete', completeSession);

export default sessionRoutes;

