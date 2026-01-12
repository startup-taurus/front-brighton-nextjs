import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const teacherPaths = [
  "/teachers",
  "/teachers/faq",
];

const adminOnlyPaths: string[] = [];
const coordinatorPaths: string[] = [];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const userCookie = request.cookies.get("token")?.value;
  let user;
  const accept = request.headers.get('accept') || '';
  const isHTML = accept.includes('text/html');

  try {
    user = userCookie ? JSON.parse(userCookie) : null;
  } catch (error) {
    user = null;
  }

  const roleId = Number(user?.role_id);
  const isProfessor = roleId === 2;

  if (!user && path.split("/")[1] !== "authentication") {
    return NextResponse.redirect(new URL("/authentication/login", request.url));
  }

  if (isHTML && user && path.split("/")[1] === "authentication") {
    if (isProfessor) {
      return NextResponse.redirect(new URL(`/teachers`, request.url));
    }
    if (roleId === 3) {
      return NextResponse.redirect(new URL(`/dashboard/student`, request.url));
    }
    if (
      roleId === 1 ||
      roleId === 4 ||
      roleId === 5 ||
      roleId === 6
    ) {
      return NextResponse.redirect(new URL(`/dashboard`, request.url));
    }
  }

  if (isProfessor && adminOnlyPaths.some(adminPath => path.startsWith(adminPath))) {
  }

  if (isProfessor && coordinatorPaths.some(coordinatorPath => path.startsWith(coordinatorPath))) {
  }

  if (isProfessor) {
    const professorIdFromQuery = request.nextUrl.searchParams.get('professorId');
    
    if (professorIdFromQuery && parseInt(professorIdFromQuery) !== Number(user.professor_id)) {
      return NextResponse.redirect(new URL("/teachers", request.url));
    }
  }

  

  const pathTeacherRegex = new RegExp(
    `^(${teacherPaths
      .map((path) => path.replace(/:\w+/g, "\\w+"))
      .join("|")})`
  );

  const professorIdQuery = request.nextUrl.searchParams.get('professorId');
  if (
    isHTML &&
    pathTeacherRegex.test(path) &&
    user &&
    !isProfessor &&
    !professorIdQuery
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
    "/admin/roles-permissions",
    "/admin/courses",
    "/admin/transfer-students",
    "/coordinator/faq",
    "/coordinator/professors",
  ],
};
