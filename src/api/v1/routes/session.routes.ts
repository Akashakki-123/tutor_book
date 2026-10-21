import { Router } from "express";
import {
  saveSession,
  getAvailableSessionsList,
  bookUserSession,
  completeSession,
} from "../controllers/session.controller.js";

const sessionRoutes = Router();

sessionRoutes.post("/", saveSession);
sessionRoutes.get("/available", getAvailableSessionsList);
sessionRoutes.post("/:id/book", bookUserSession);
sessionRoutes.patch("/:id/complete", completeSession);

export default sessionRoutes;
