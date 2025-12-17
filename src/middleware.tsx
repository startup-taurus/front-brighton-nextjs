import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const teacherPaths = [
  "/teachers",
  "/teachers/faq",
];

const adminOnlyPaths = [
  "/admin/transfer-students",
  "/admin/users",
  "/admin/dashboard",
  "/admin/students",
  "/admin/syllabus",
  "/admin/teachers",
];

const coordinatorPaths = [
  "/coordinator/faq",
  "/coordinator/professors",
];

const receptionistRestrictedPaths = [
  "/admin/syllabus",
  "/admin/holidays",
  "/admin/users", 
];

const coordinatorRestrictedPaths = [
  "/admin/users", 
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

  if (!user && path.split("/")[1] !== "authentication") {
    return NextResponse.redirect(new URL("/authentication/login", request.url));
  }

  if (user && path.split("/")[1] === "authentication") {
    if (user?.role_id === 2) {
      return NextResponse.redirect(new URL(`/teachers`, request.url));
    }
    if (user?.role_id === 3) {
      return NextResponse.redirect(new URL(`/dashboard/student`, request.url));
    }
    if (
      user?.role_id === 1 ||
      user?.role_id === 4 ||
      user?.role_id === 5 ||
      user?.role_id === 6
    ) {
      return NextResponse.redirect(new URL(`/dashboard`, request.url));
    }
  }

  if (user?.role_id === 2 && adminOnlyPaths.some(adminPath => path.startsWith(adminPath))) {
    return NextResponse.redirect(new URL("/teachers", request.url));
  }

  if (user?.role_id === 2 && coordinatorPaths.some(coordinatorPath => path.startsWith(coordinatorPath))) {
    return NextResponse.redirect(new URL("/teachers", request.url));
  }

  if (user?.role_id === 2) {
    const professorIdFromQuery = request.nextUrl.searchParams.get('professorId');
    
    if (professorIdFromQuery && parseInt(professorIdFromQuery) !== user.professor_id) {
      return NextResponse.redirect(new URL("/teachers", request.url));
    }
  }

  if (user?.role_id === 5 && coordinatorRestrictedPaths.some(restrictedPath => path.startsWith(restrictedPath))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user?.role_id === 6 && receptionistRestrictedPaths.some(restrictedPath => path.startsWith(restrictedPath))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const pathTeacherRegex = new RegExp(
    `^(${teacherPaths
      .map((path) => path.replace(/:\w+/g, "\\w+"))
      .join("|")})`
  );

  if (
    pathTeacherRegex.test(path) &&
    user &&
    user?.role_id !== 2
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    new RegExp(`^(/dashboard|/admin(\\/.*)?)$`).test(path) &&
    user &&
    user?.role_id !== 1 &&
    user?.role_id !== 5 &&
    user?.role_id !== 4 &&
    user?.role_id !== 6
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
    "/admin/courses",
    "/admin/transfer-students",
    "/coordinator/faq",
    "/coordinator/professors",
  ],
};
