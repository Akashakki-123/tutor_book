import { Router } from 'express';
import { saveUser, getUserSessionList } from '../controllers/user.controller.js';

const userRoutes = Router();

// API 1: POST /users
userRoutes.post('/', saveUser);

// API 6: GET /users/:id/sessions
userRoutes.get('/:id/sessions', getUserSessionList);

export default userRoutes;

