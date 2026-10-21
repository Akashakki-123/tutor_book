import { Router } from "express";
import { saveTeacher, listTeachers } from "../controllers/teacher.controller.js";

const teacherRoutes = Router();

teacherRoutes.post("/", saveTeacher);
teacherRoutes.get("/", listTeachers);

export default teacherRoutes;
