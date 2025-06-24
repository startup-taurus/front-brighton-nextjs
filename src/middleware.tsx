import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const USER_TYPES = {
  ADMIN: "admin_staff",
  PROFESSOR: "professor",
  STUDENT: "student",
  COORDINATOR: "coordinator",
  FINANCIAL: "financial",
};

const teacherPaths = [
  "/teachers",
  "/teachers/faq",
  "/course/:id/home",
  "/course/:id/attendance",
  "/course/:id/holidays",
  "/course/:id/gradebook",
  "/course/:id/student-report",
  "/course/:id/faq",
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const userCookie = request.cookies.get("token")?.value;
  let user;

  try {
    user = userCookie ? JSON.parse(userCookie) : null;
  } catch (error) {
    user = null;
  }

  if (!user && path.split("/")[1] === "authentication") {
    return NextResponse.next();
  }

  if (!user && path.split("/")[1] !== "authentication") {
    return NextResponse.redirect(new URL("/authentication/login", request.url));
  }

  if (
    path.split("/")[1] === "authentication" &&
    user &&
    user?.role === USER_TYPES.PROFESSOR
  ) {
    return NextResponse.redirect(new URL(`/teachers`, request.url));
  }

  if (
    path.split("/")[1] === "authentication" &&
    user &&
    user?.role === USER_TYPES.STUDENT
  ) {
    return NextResponse.redirect(new URL(`/teachers`, request.url)); 
  }

  if (
    path.split("/")[1] === "authentication" &&
    user &&
    (user?.role === USER_TYPES.ADMIN || user?.role === USER_TYPES.COORDINATOR)
  ) {
    return NextResponse.redirect(new URL(`/dashboard`, request.url));
  }

  const pathTeacherRegex = new RegExp(
    `^(${teacherPaths
      .map((path) => path.replace(/:\w+/g, "\\w+"))
      .join("|")})`
  );

  if (
    pathTeacherRegex.test(path) &&
    user &&
    user?.role !== USER_TYPES.PROFESSOR
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    new RegExp(`^(/dashboard|/admin(\\/.*)?)$`).test(path) &&
    user &&
    (user?.role === USER_TYPES.PROFESSOR || user?.role === USER_TYPES.STUDENT)
  ) {
    return NextResponse.redirect(new URL("/teachers", request.url));
  }

  if (
    new RegExp(`^(/dashboard|/admin(\\/.*)?)$`).test(path) &&
    user &&
    user?.role !== USER_TYPES.ADMIN &&
    user?.role !== USER_TYPES.COORDINATOR
  ) {
    return NextResponse.redirect(new URL("/teachers", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/authentication/login",
    "/teachers",
    "/teachers/faq",
    "/course/:id/home",
    "/course/:id/attendance",
    "/course/:id/holidays",
    "/course/:id/gradebook",
    "/course/:id/student-report",
    "/course/:id/faq",
    "/dashboard",
    "/admin",
    "/admin/dashboard",
    "/admin/holidays",
    "/admin/students",
    "/admin/syllabus",
    "/admin/teachers",
    "/admin/users",
  ],
};
