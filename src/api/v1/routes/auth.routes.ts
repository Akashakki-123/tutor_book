import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { saveUser } from "../controllers/user.controller.js";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/register", saveUser);

export default authRoutes;
