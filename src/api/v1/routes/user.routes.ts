import { Router } from "express";
import { saveUser, getUserSessionList } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.post("/", saveUser);
userRoutes.get("/:id/sessions", getUserSessionList);

export default userRoutes;
