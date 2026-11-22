import type { Express, Request, Response } from "express";
import AssignmentsDao, { type AssignmentDraft } from "./dao";

function readUpdates(body: Partial<AssignmentDraft>): Partial<AssignmentDraft> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { title, description, due, available, points } = body;
  if ((title !== undefined && (typeof title !== "string" || !title.trim())) ||
      [description, due, available].some((value) => value !== undefined && typeof value !== "string") ||
      (points !== undefined && (!Number.isFinite(points) || points < 0))) return null;

  return {
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(due !== undefined ? { due } : {}),
    ...(available !== undefined ? { available } : {}),
    ...(points !== undefined ? { points } : {}),
  };
}

export default function AssignmentRoutes(app: Express, db: Parameters<typeof AssignmentsDao>[0]) {
  const dao = AssignmentsDao(db);
  const findAssignmentsForCourse = (req: Request<{ courseId: string }>, res: Response) => {
    res.json(dao.findAssignmentsForCourse(req.params.courseId));
  };

  const createAssignmentForCourse = (req: Request<{ courseId: string }>, res: Response) => {
    const updates = readUpdates(req.body);
    if (!updates?.title) {
      res.status(400).json({ message: "Invalid assignment details" });
      return;
    }
    const { title, description = "", points = 100, due = "", available = "" } = updates;
    res.json(dao.createAssignment(req.params.courseId, { title, description, points, due, available }));
  };

  const updateAssignment = (req: Request<{ assignmentId: string }>, res: Response) => {
    const updates = readUpdates(req.body);
    if (!updates || Object.keys(updates).length === 0) {
      res.status(400).json({ message: "Invalid assignment details" });
      return;
    }
    const saved = dao.updateAssignment(req.params.assignmentId, updates);
    if (!saved) {
      res.sendStatus(404);
      return;
    }
    res.json(saved);
  };

  const deleteAssignment = (req: Request<{ assignmentId: string }>, res: Response) => {
    dao.deleteAssignment(req.params.assignmentId);
    res.sendStatus(200);
  };

  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.put("/api/assignments/:assignmentId", updateAssignment);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
}
