import type { Express, Request, Response } from "express";
import ModulesDao from "./dao";

export default function ModuleRoutes(app: Express, db: Parameters<typeof ModulesDao>[0]) {
  const dao = ModulesDao(db);
  const findModulesForCourse = (req: Request<{ courseId: string }>, res: Response) => {
    const { courseId } = req.params;
    res.json(dao.findModulesForCourse(courseId));
  };

  const createModuleForCourse = (req: Request<{ courseId: string }>, res: Response) => {
    const { courseId } = req.params;
    if (typeof req.body?.name !== "string" || !req.body.name.trim()) {
      res.status(400).json({ message: "Module name is required" });
      return;
    }

    const module = { description: "", lessons: [], ...req.body, course: courseId };
    const newModule = dao.createModule(module);
    res.json(newModule);
  };

  const deleteModule = (req: Request<{ moduleId: string }>, res: Response) => {
    dao.deleteModule(req.params.moduleId);
    res.sendStatus(200);
  };

  const updateModule = (req: Request<{ moduleId: string }>, res: Response) => {
    const { name, description } = req.body ?? {};
    if ((name !== undefined && (typeof name !== "string" || !name.trim())) ||
        (description !== undefined && typeof description !== "string") ||
        (name === undefined && description === undefined)) {
      res.status(400).json({ message: "Invalid module updates" });
      return;
    }
    const saved = dao.updateModule(req.params.moduleId, {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description } : {}),
    });
    if (!saved) {
      res.sendStatus(404);
      return;
    }
    res.json(saved);
  };

  app.delete("/api/modules/:moduleId", deleteModule);
  app.put("/api/modules/:moduleId", updateModule);
  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.post("/api/courses/:courseId/modules", createModuleForCourse);
}
