import { sidebarMenuType } from "Types/LayoutDataType";

export const TeacherMenuList: sidebarMenuType[] = [
  {
    title: "General",
    menucontent: "Módulo de inicio",
    Items: [
      {
        title: "👩‍🏫 DASHBOARD",
        id: 1,
        pathSlice: "dashboard",
        type: "link",
        badge: "badge badge-light-primary",
        path: "teachers",
      },
      {
        title: "❓ FAQ",
        id: 2,
        pathSlice: "faq",
        type: "link",
        badge: "badge badge-light-primary",
        path: "teachers/faq",
      },
    ],
  },
];

export const AdminMenuList: sidebarMenuType[] = [
  {
    title: "General",
    menucontent: "Módulo de inicio",
    Items: [
      {
        title: "Dashboard",
        id: 1,
        pathSlice: "dashboard",
        type: "link",
        icon: "home",
        badge: "badge badge-light-primary",
        path: "dashboard",
      },
      {
        title: "Students",
        id: 4,
        pathSlice: "admin/students",
        type: "link",
        icon: "blog",
        badge: "badge badge-light-primary",
        path: "admin/students",
      },
      {
        title: "Registered Students",
        id: 10,
        pathSlice: "registered-students",
        type: "link",
        icon: "blog",
        badge: "badge badge-light-primary",
        path: "admin/registered-students",
      },
      {
        title: "Syllabus",
        id: 3,
        pathSlice: "Syllabus",
        type: "link",
        icon: "layout",
        badge: "badge badge-light-primary",
        path: "admin/syllabus",
      },
      {
        title: "Courses",
        id: 3,
        pathSlice: "courses",
        type: "link",
        icon: "others",
        badge: "badge badge-light-primary",
        path: "admin/courses",
      },

      {
        title: "Professors",
        id: 5,
        pathSlice: "teachers",
        type: "link",
        icon: "learning",
        badge: "badge badge-light-primary",
        path: "admin/teachers",
      },
      {
        title: "Users",
        id: 6,
        pathSlice: "users",
        type: "link",
        icon: "user",
        badge: "badge badge-light-primary",
        path: "admin/users",
      },
      {
        title: "Holidays",
        id: 2,
        pathSlice: "holidays",
        type: "link",
        icon: "calendar",
        badge: "badge badge-light-primary",
        path: "admin/holidays",
      },
    ],
  },
];
