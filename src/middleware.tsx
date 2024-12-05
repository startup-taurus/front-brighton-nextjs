import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { USER_TYPES } from "../utils/constants";

const teacherPaths = [
  "/authentication/login",
  "/teachers",
  "/teachers/faq",
  "/course/:id/home",
  "/course/:id/attendance",
  "/course/:id/holidays",
  "/course/:id/gradebook",
  "/course/:id/student-report",
  "/course/:id/faq",
];

const adminPaths = ["/dashboard", "/admin", "/admin/:path*"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const userCookie = request.cookies.get("token")?.value;
  let user;

  try {
    user = userCookie ? JSON.parse(userCookie) : null;
  } catch (error) {
    user = null;
  }

  if (
    !path.startsWith("/authentication") &&
    !path.startsWith("/_next") &&
    !path.startsWith("/api") &&
    !user
  ) {
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
    user?.role === USER_TYPES.ADMIN
  ) {
    return NextResponse.redirect(new URL(`/dashboard`, request.url));
  }

  const pathTeacherRegex = new RegExp(
    `^(${teacherPaths
      .map((path) => path.replace(/:\w+/g, "\\w+"))
      .join("|")})$`,
  );

  if (
    pathTeacherRegex.test(path) &&
    user &&
    user?.role !== USER_TYPES.PROFESSOR
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  console.log(new RegExp(`^(/dashboard|/admin(\\/.*)?)$`).test(path));
  if (
    new RegExp(`^(/dashboard|/admin(\\/.*)?)$`).test(path) &&
    user &&
    user?.role !== USER_TYPES.ADMIN
  ) {
    console.log("Entra aqui  es teacher");
    return NextResponse.redirect(new URL("/teachers", request.url));
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: [
//     "/",
//     "/authentication/login",
//     "/teachers",
//     "/teachers/faq",
//     "/course/:id/home",
//     "/course/:id/attendance",
//     "/course/:id/holidays",
//     "/course/:id/gradebook",
//     "/course/:id/student-report",
//     "/course/:id/faq",
//     "/dashboard",
//     "/admin",
//     "/admin/:path*",
//   ],
// };
