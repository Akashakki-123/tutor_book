import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { saveUser } from '../controllers/user.controller.js';

const authRoutes = Router();

// POST /auth/login
authRoutes.post('/login', login);

// POST /auth/register (alias to saveUser)
authRoutes.post('/register', saveUser);

export default authRoutes;

