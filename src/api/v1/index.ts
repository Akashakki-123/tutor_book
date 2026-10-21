import { Router, Request, Response } from "express";
import { success } from "./helpers/response.helper.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  success(res, "API is running", {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/teachers", teacherRoutes);

export default router;
