import { Router } from 'express';
import { saveTeacher, listTeachers } from '../controllers/teacher.controller.js';

const teacherRoutes = Router();

// POST /teachers (Helper endpoint to seed/create teachers)
teacherRoutes.post('/', saveTeacher);

// GET /teachers (Helper endpoint to list teachers)
teacherRoutes.get('/', listTeachers);

export default teacherRoutes;

