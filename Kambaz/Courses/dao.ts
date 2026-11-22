import { v4 as uuidv4 } from "uuid";
export default function CoursesDao(db) {
  function findAllCourses() {
    return db.courses;
  }
  function findCoursesForEnrolledUser(userId) {
    const { courses, enrollments } = db;
    return courses.filter((course) =>
      enrollments.some(
        (enrollment) =>
          enrollment.user === userId && enrollment.course === course._id,
      ),
    );
  }
  function createCourse(course) {
    const newCourse = { ...course, _id: uuidv4() };
    db.courses = [...db.courses, newCourse];
    return newCourse;
  }

  function deleteCourse(courseId: string) {
    const { courses, enrollments } = db;
    db.courses = courses.filter((course) => course._id !== courseId);
    db.enrollments = enrollments.filter((enrollment) => enrollment.course !== courseId);
  }

  function updateCourse(courseId: string, courseUpdates) {
    const { courses } = db;
    const index = courses.findIndex((course) => course._id === courseId);
    if (index === -1) return undefined;
    const course = { ...courses[index], ...courseUpdates, _id: courseId };
    courses[index] = course;
    return course;
  }

  return { findAllCourses, findCoursesForEnrolledUser, createCourse, deleteCourse, updateCourse };
}