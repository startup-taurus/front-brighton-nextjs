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
        title: "👩‍🏫 Hola",
        id: 1,
        pathSlice: "dashboard",
        type: "link",
        badge: "badge badge-light-primary",
        path: "teachers",
      },
    ],
  },
];
