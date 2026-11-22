import { v4 as uuidv4 } from "uuid";

export type User = {
  _id: string;
  username: string;
  password?: string;
  role: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
};

export type UserUpdates = Partial<Pick<User, "username" | "password" | "firstName" | "lastName" | "dob" | "email">>;

export default function UsersDao(db: { users: User[] }) {
  const demoUsers = new Set(db.users.map((user) => user._id));
  const findUserByCredentials = (username: string, password: string) => {
    if (typeof password !== "string" || !password) return undefined;
    return db.users.find((user) => {
      const expectedPassword = user.password ??
        (demoUsers.has(user._id) ? process.env.DEMO_USER_PASSWORD : undefined);
      return user.username === username && expectedPassword === password;
    });
  };
  const findUserByUsername = (username: string) =>
    db.users.find((user) => user.username === username);
  const createUser = (credentials: Pick<User, "username" | "password">) => {
    const user = { ...credentials, _id: uuidv4(), role: "USER" };
    db.users.push(user);
    return user;
  };

  const findUserById = (userId: string) =>
    db.users.find((user) => user._id === userId);

  const updateUser = (userId: string, user: UserUpdates) => {
    db.users = db.users.map((u) => (u._id === userId ? { ...u, ...user } : u));
  };

  return { findUserByCredentials, findUserByUsername, createUser, findUserById, updateUser };
}
