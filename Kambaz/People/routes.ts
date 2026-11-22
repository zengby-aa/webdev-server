import type { Express, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type database from "../Database";
import EnrollmentsDao from "../Enrollments/dao";
import UsersDao from "../Users/dao";

type User = (typeof database.users)[number];

function publicUser(user: User) {
  const { password: _password, ...account } = user;
  return account;
}

export default function PeopleRoutes(app: Express, db: typeof database) {
  const enrollments = EnrollmentsDao(db);
  const users = UsersDao(db);
  const isEnrolled = (userId: string, courseId: string) =>
    db.enrollments.some((item) => item.user === userId && item.course === courseId);

  function canManage(req: Request<{ courseId: string }>, res: Response) {
    const currentUser = req.session.currentUser;
    const user = currentUser && users.findUserById(currentUser._id);
    if (!user || user.role !== "FACULTY" || !isEnrolled(user._id, req.params.courseId)) {
      res.sendStatus(user ? 403 : 401);
      return false;
    }
    return true;
  }

  function findStudent(req: Request<{ courseId: string; userId: string }>, res: Response) {
    const { userId, courseId } = req.params;
    const user = db.users.find((item) => item._id === userId && isEnrolled(item._id, courseId));
    if (!user) res.sendStatus(404);
    else if (user.role !== "STUDENT" && user.role !== "USER") res.sendStatus(403);
    else return user;
  }

  const list = (req: Request<{ courseId: string }>, res: Response) => {
    const currentUser = req.session.currentUser;
    if (!currentUser || !users.findUserById(currentUser._id)) {
      res.sendStatus(401);
      return;
    }
    if (!isEnrolled(currentUser._id, req.params.courseId)) {
      res.sendStatus(403);
      return;
    }
    res.json(db.users.filter((user) => isEnrolled(user._id, req.params.courseId)).map(publicUser));
  };

  const create = (req: Request<{ courseId: string }>, res: Response) => {
    if (!canManage(req, res)) return;
    const { username, password, firstName, lastName } = req.body ?? {};
    if ([username, password, firstName, lastName].some((value) => typeof value !== "string" || !value.trim())) {
      res.status(400).json({ message: "Username, password and names are required" });
      return;
    }
    if (users.findUserByUsername(username.trim())) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    const user: User = {
      _id: uuidv4(), username: username.trim(), password, firstName: firstName.trim(),
      lastName: lastName.trim(), role: "STUDENT", email: "", loginId: username.trim(),
      section: "", lastActivity: "", totalActivity: "",
    };
    db.users.push(user);
    enrollments.enrollUserInCourse(user._id, req.params.courseId);
    res.json(publicUser(user));
  };

  const update = (req: Request<{ courseId: string; userId: string }>, res: Response) => {
    if (!canManage(req, res)) return;
    const user = findStudent(req, res);
    if (!user) return;
    const { firstName, lastName } = req.body ?? {};
    if (typeof firstName !== "string" || !firstName.trim() || typeof lastName !== "string" || !lastName.trim()) {
      res.status(400).json({ message: "First and last names are required" });
      return;
    }
    Object.assign(user, { firstName: firstName.trim(), lastName: lastName.trim() });
    res.json(publicUser(user));
  };

  const remove = (req: Request<{ courseId: string; userId: string }>, res: Response) => {
    if (!canManage(req, res)) return;
    const user = findStudent(req, res);
    if (!user) return;
    db.users = db.users.filter((item) => item._id !== user._id);
    db.enrollments = db.enrollments.filter((item) => item.user !== user._id);
    res.sendStatus(200);
  };

  app.get("/api/courses/:courseId/users", list);
  app.post("/api/courses/:courseId/users", create);
  app.put("/api/courses/:courseId/users/:userId", update);
  app.delete("/api/courses/:courseId/users/:userId", remove);
}
