import "dotenv/config";
import session from "express-session";
import express from "express";
import cors from "cors";
import Hello from "./Hello";
import Lab5 from "./Lab5/index";
import db from "./Kambaz/Database";
import UserRoutes from "./Kambaz/Users/routes";
import CourseRoutes from "./Kambaz/Courses/routes";
import ModuleRoutes from "./Kambaz/Modules/routes";
import AssignmentRoutes from "./Kambaz/Assignments/routes";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes";
import PeopleRoutes from "./Kambaz/People/routes";
const app = express();
const clientOrigin = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({
  credentials: true,
  origin: clientOrigin,
}));

const production = (process.env.SERVER_ENV || process.env.NODE_ENV) === "production";
const secret = process.env.SESSION_SECRET;
if (production && !secret) {
  throw new Error("SESSION_SECRET is required in production");
}
const sessionOptions: session.SessionOptions = {
  secret: secret || "kambaz",
  resave: false,
  saveUninitialized: false,
};
if (production) {
  sessionOptions.proxy = true;
  sessionOptions.cookie = { sameSite: "none", secure: true };
}
app.use(session(sessionOptions));
app.use(express.json());
UserRoutes(app, db);
CourseRoutes(app, db);
ModuleRoutes(app, db);
AssignmentRoutes(app, db);
EnrollmentRoutes(app, db);
PeopleRoutes(app, db);
Lab5(app);
Hello(app);
app.listen(process.env.PORT || 4000);