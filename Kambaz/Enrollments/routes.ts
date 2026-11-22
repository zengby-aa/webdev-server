import type { Express, Request, Response } from "express";
import type database from "../Database";
import EnrollmentsDao from "./dao";
import UsersDao from "../Users/dao";

export default function EnrollmentRoutes(app: Express, db: typeof database) {
  const enrollments = EnrollmentsDao(db);
  const users = UsersDao(db);

  const changeEnrollment = (enroll: boolean) =>
    (req: Request<{ uid: string; cid: string }>, res: Response) => {
      const currentUser = req.session.currentUser;
      if (!currentUser || !users.findUserById(currentUser._id)) {
        res.sendStatus(401);
        return;
      }
      const { uid, cid } = req.params;
      if (uid !== "current" && uid !== currentUser._id) {
        res.sendStatus(403);
        return;
      }
      if (!db.courses.some((course) => course._id === cid)) {
        res.sendStatus(404);
        return;
      }
      if (enroll) enrollments.enrollUserInCourse(currentUser._id, cid);
      else enrollments.unenrollUserFromCourse(currentUser._id, cid);
      res.sendStatus(200);
    };

  app.post("/api/users/:uid/courses/:cid", changeEnrollment(true));
  app.delete("/api/users/:uid/courses/:cid", changeEnrollment(false));
}
