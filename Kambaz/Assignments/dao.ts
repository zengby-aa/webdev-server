import { v4 as uuidv4 } from "uuid";
import type database from "../Database";

type Assignment = (typeof database.assignments)[number];
export type AssignmentDraft = Omit<Assignment, "_id" | "course">;

export default function AssignmentsDao(db: Pick<typeof database, "assignments">) {
  const findAssignmentsForCourse = (courseId: string) =>
    db.assignments.filter((assignment) => assignment.course === courseId);

  const createAssignment = (courseId: string, draft: AssignmentDraft) => {
    const assignment = { ...draft, _id: uuidv4(), course: courseId };
    db.assignments.push(assignment);
    return assignment;
  };

  const updateAssignment = (assignmentId: string, updates: Partial<AssignmentDraft>) => {
    const assignment = db.assignments.find((item) => item._id === assignmentId);
    if (assignment) return Object.assign(assignment, updates);
  };

  const deleteAssignment = (assignmentId: string) => {
    db.assignments = db.assignments.filter((item) => item._id !== assignmentId);
  };

  return { findAssignmentsForCourse, createAssignment, updateAssignment, deleteAssignment };
}
