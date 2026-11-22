import { v4 as uuidv4 } from "uuid";

type Enrollment = { _id: string; user: string; course: string };

export default function EnrollmentsDao(db: { enrollments: Enrollment[] }) {
  function enrollUserInCourse(userId: string, courseId: string) {
    const { enrollments } = db;
    if (enrollments.some((item) => item.user === userId && item.course === courseId)) return;
    enrollments.push({ _id: uuidv4(), user: userId, course: courseId });
  }

  function unenrollUserFromCourse(userId: string, courseId: string) {
    db.enrollments = db.enrollments.filter((item) => item.user !== userId || item.course !== courseId);
  }

  return { enrollUserInCourse, unenrollUserFromCourse };
}
