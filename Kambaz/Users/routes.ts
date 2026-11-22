import type { Express, Request, Response, NextFunction } from "express";
import UsersDao, { type User, type UserUpdates } from "./dao";

declare module "express-session" {
  interface SessionData {
    currentUser?: Omit<User, "password">;
  }
}

export default function UserRoutes(app: Express, db: { users: User[] }) {
  const dao = UsersDao(db);

  const respondWithUser = (req: Request, res: Response, user: User) => {
    const { password: _password, ...account } = user;
    req.session.currentUser = account;
    res.json(account);
  };

  const startSession = (req: Request, res: Response, next: NextFunction, user: User) => {
    req.session.regenerate((error) => {
      if (error) return next(error);
      respondWithUser(req, res, user);
    });
  };

  const signup = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || !username.trim() ||
        typeof password !== "string" || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }
    if (dao.findUserByUsername(username)) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    startSession(req, res, next, dao.createUser({ username, password }));
  };

  const signin = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body ?? {};
    const user = dao.findUserByCredentials(username, password);
    if (!user) {
      res.status(401).json({ message: "Unable to login. Try again later." });
      return;
    }
    startSession(req, res, next, user);
  };

  const signout = (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie("connect.sid");
      res.sendStatus(200);
    });
  };

  const profile = (req: Request, res: Response) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };

  const updateUser = (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;
    const currentUser = req.session.currentUser;
    if (!currentUser || currentUser._id !== userId) {
      res.status(403).json({ message: "You can only update your own profile" });
      return;
    }

    const userUpdates: UserUpdates = {};
    const fields = ["username", "password", "firstName", "lastName", "dob", "email"] as const;
    for (const field of fields) {
      const value = req.body?.[field];
      if (value === undefined) continue;
      if (typeof value !== "string" ||
          ((field === "username" || field === "password") && !value.trim())) {
        res.status(400).json({ message: "Invalid profile information" });
        return;
      }
      userUpdates[field] = value;
    }

    if (userUpdates.username && userUpdates.username !== currentUser.username &&
        dao.findUserByUsername(userUpdates.username)) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }

    dao.updateUser(userId, userUpdates);
    const user = dao.findUserById(userId);
    if (!user) {
      res.sendStatus(404);
      return;
    }
    respondWithUser(req, res, user);
  };

  app.put("/api/users/:userId", updateUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.get("/api/users/profile", profile);
}
