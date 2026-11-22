import CoursesDao from "./dao";
import EnrollmentsDao from "../Enrollments/dao";
export default function CourseRoutes(app, db) {
  const dao = CoursesDao(db);
  const enrollmentsDao = EnrollmentsDao(db);
  const findAllCourses = (req, res) => {
    res.json(dao.findAllCourses());
  };
  const findCoursesForEnrolledUser = (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    res.json(dao.findCoursesForEnrolledUser(userId));
  };
  const createCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    if (typeof req.body?.name !== "string" || !req.body.name.trim()) {
      res.status(400).json({ message: "Course name is required" });
      return;
    }
    const newCourse = dao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  const requireEnrolledUser = (req, res, next) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const { courseId } = req.params;
    if (!dao.findAllCourses().some((course) => course._id === courseId)) {
      res.sendStatus(404);
      return;
    }
    if (!dao.findCoursesForEnrolledUser(currentUser._id).some((course) => course._id === courseId)) {
      res.sendStatus(403);
      return;
    }
    next();
  };

  const deleteCourse = (req, res) => {
    const { courseId } = req.params;
    dao.deleteCourse(courseId);
    res.sendStatus(200);
  };

  const updateCourse = (req, res) => {
    const { courseId } = req.params;
    const updates = req.body;
    if (!updates || typeof updates !== "object" || Array.isArray(updates) ||
        ("name" in updates && (typeof updates.name !== "string" || !updates.name.trim()))) {
      res.status(400).json({ message: "Invalid course updates" });
      return;
    }
    const course = dao.updateCourse(courseId, updates);
    res.json(course);
  };

  app.delete("/api/courses/:courseId", requireEnrolledUser, deleteCourse);
  app.put("/api/courses/:courseId", requireEnrolledUser, updateCourse);
  app.post("/api/users/current/courses", createCourse);
  app.get("/api/courses", findAllCourses);
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
}