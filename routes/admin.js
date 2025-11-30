import express from 'express'
import { isAuth, isAdmin, isSuperAdmin } from '../middlewares/isAuth.js'
import { addLecture, createCourse, deleteLecture, deleteCourse, getAllStats, updateRole, getAllUsers } from '../controllers/admin.js'
import { uploadFiles } from '../middlewares/multer.js'

const router = express.Router()

router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse)

router.post("/course/lecture/:id", isAuth, isAdmin, uploadFiles, addLecture)

router.delete("/course/:id", isAuth, isAdmin, deleteCourse)

router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture)

router.get("/stats", isAuth, isAdmin, getAllStats)

router.put("/user/:id", isAuth, isAdmin, isSuperAdmin, updateRole)

router.get("/users", isAuth, isAdmin, getAllUsers);

export default router