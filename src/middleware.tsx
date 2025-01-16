import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const USER_TYPES = {
  ADMIN: "admin_staff",
  PROFESSOR: "professor",
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
  // console.log(user, path.split("/"));

  // if (!user && path.split("/")[1] === "authentication") {
  //   console.log("Entra 0");
  //   return NextResponse.next();
  // }
  //
  // if (!user && path.split("/")[1] !== "authentication") {
  //   return NextResponse.redirect(new URL("/authentication/login", request.url));
  // }
  //
  // if (
  //   path.split("/")[1] === "authentication" &&
  //   user &&
  //   user?.role === USER_TYPES.PROFESSOR
  // ) {
  //   console.log("Entra");
  //   return NextResponse.redirect(new URL(`/teachers`, request.url));
  // }
  //
  // if (
  //   path.split("/")[1] === "authentication" &&
  //   user &&
  //   user?.role === USER_TYPES.ADMIN
  // ) {
  //   return NextResponse.redirect(new URL(`/dashboard`, request.url));
  // }
  //
  // const pathTeacherRegex = new RegExp(
  //   `^(${teacherPaths
  //     .map((path) => path.replace(/:\w+/g, "\\w+"))
  //     .join("|")})$`,
  // );
  //
  // if (
  //   pathTeacherRegex.test(path) &&
  //   user &&
  //   user?.role !== USER_TYPES.PROFESSOR
  // ) {
  //   console.log("Entra 2");
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }
  //
  // if (
  //   new RegExp(`^(/dashboard|/admin(\\/.*)?)$`).test(path) &&
  //   user &&
  //   user?.role !== USER_TYPES.ADMIN
  // ) {
  //   console.log("Entra 3");
  //   return NextResponse.redirect(new URL("/teachers", request.url));
  // }
  // console.log("Sale");
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
