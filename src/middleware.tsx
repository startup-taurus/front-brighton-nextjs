import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const USER_TYPES = {
  ADMIN: "admin_staff",
  PROFESSOR: "professor", 
  STUDENT: "student",
  COORDINATOR: "coordinator",
  FINANCIAL: "financial",
  RECEPTIONIST: "receptionist"
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
    if (user?.role === USER_TYPES.PROFESSOR) {
      return NextResponse.redirect(new URL(`/teachers`, request.url));
    }
    if (user?.role === USER_TYPES.STUDENT) {
      return NextResponse.redirect(new URL(`/teachers`, request.url));
    }
    if (user?.role === USER_TYPES.ADMIN || user?.role === USER_TYPES.COORDINATOR || user?.role === USER_TYPES.FINANCIAL || user?.role === USER_TYPES.RECEPTIONIST) {
      return NextResponse.redirect(new URL(`/dashboard`, request.url));
    }
  }

  if (user?.role === USER_TYPES.PROFESSOR && adminOnlyPaths.some(adminPath => path.startsWith(adminPath))) {
    const redirectUrl = new URL("/teachers", request.url);
    redirectUrl.searchParams.set('access_denied', 'admin');
    return NextResponse.redirect(redirectUrl);
  }

  if (user?.role === USER_TYPES.PROFESSOR && coordinatorPaths.some(coordinatorPath => path.startsWith(coordinatorPath))) {
    const redirectUrl = new URL("/teachers", request.url);
    redirectUrl.searchParams.set('access_denied', 'coordinator');
    return NextResponse.redirect(redirectUrl);
  }

  if (user?.role === USER_TYPES.PROFESSOR) {
    const professorIdFromQuery = request.nextUrl.searchParams.get('professorId');
    
    if (professorIdFromQuery && parseInt(professorIdFromQuery) !== user.professor_id) {
      const redirectUrl = new URL("/teachers", request.url);
      redirectUrl.searchParams.set('access_denied', 'professor');
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user?.role === USER_TYPES.COORDINATOR && coordinatorRestrictedPaths.some(restrictedPath => path.startsWith(restrictedPath))) {
    const redirectUrl = new URL("/dashboard", request.url);
    redirectUrl.searchParams.set('access_denied', 'admin');
    return NextResponse.redirect(redirectUrl);
  }

  if (user?.role === USER_TYPES.RECEPTIONIST && receptionistRestrictedPaths.some(restrictedPath => path.startsWith(restrictedPath))) {
    const redirectUrl = new URL("/dashboard", request.url);
    redirectUrl.searchParams.set('access_denied', 'receptionist');
    return NextResponse.redirect(redirectUrl);
  }

  const pathTeacherRegex = new RegExp(
    `^(${teacherPaths
      .map((path) => path.replace(/:\w+/g, "\\w+"))
      .join("|")})`
  );

  if (
    pathTeacherRegex.test(path) &&
    user &&
    user?.role !== USER_TYPES.PROFESSOR &&
    user?.role !== USER_TYPES.COORDINATOR &&
    user?.role !== USER_TYPES.RECEPTIONIST
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    new RegExp(`^(/dashboard|/admin(\\/.*)?)$`).test(path) &&
    user &&
    user?.role !== USER_TYPES.ADMIN &&
    user?.role !== USER_TYPES.COORDINATOR &&
    user?.role !== USER_TYPES.FINANCIAL &&
    user?.role !== USER_TYPES.RECEPTIONIST
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
    "/admin/transfer-students",
    "/coordinator/faq",
    "/coordinator/professors",
  ],
};