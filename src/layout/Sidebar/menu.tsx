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
        title: "Holidays",
        id: 1,
        pathSlice: "dashboard",
        type: "link",
        icon: "calendar",
        badge: "badge badge-light-primary",
        path: "admin/holidays",
      },
      {
        title: "Courses",
        id: 1,
        pathSlice: "dashboard",
        type: "link",
        icon: "others",
        badge: "badge badge-light-primary",
        path: "admin/courses",
      },
      {
        title: "Student",
        id: 1,
        pathSlice: "dashboard",
        type: "link",
        icon: "blog",
        badge: "badge badge-light-primary",
        path: "admin/students",
      },
      {
        title: "Teachers",
        id: 1,
        pathSlice: "dashboard",
        type: "link",
        icon: "learning",
        badge: "badge badge-light-primary",
        path: "admin/teachers",
      },
      {
        title: "Users",
        id: 1,
        pathSlice: "dashboard",
        type: "link",
        icon: "user",
        badge: "badge badge-light-primary",
        path: "admin/users",
      },
    ],
  },
];
