import { v4 as uuidv4 } from "uuid";
import type database from "../Database";

export default function ModulesDao(db: Pick<typeof database, "modules">) {
  function findModulesForCourse(courseId: string) {
    const { modules } = db;
    return modules.filter((module) => module.course === courseId);
  }

  function createModule(module: Omit<(typeof database.modules)[number], "_id">) {
    const newModule = { ...module, _id: uuidv4() };
    db.modules = [...db.modules, newModule];
    return newModule;
  }

  function deleteModule(moduleId: string) {
    const { modules } = db;
    db.modules = modules.filter((module) => module._id !== moduleId);
  }

  function updateModule(moduleId: string, updates: Partial<Pick<(typeof database.modules)[number], "name" | "description">>) {
    const module = db.modules.find((module) => module._id === moduleId);
    if (!module) return undefined;
    return Object.assign(module, updates);
  }

  return { findModulesForCourse, createModule, deleteModule, updateModule };
}
