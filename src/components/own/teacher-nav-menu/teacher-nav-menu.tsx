import React, { useEffect, useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useRouter } from "next/router";
import Link from "next/link";

const NAV_ITEMS = [
  {
    id: "home",
    name: "🏠 HOME",
    link: "/course/${id}/home",
  },
  {
    id: "attendance",
    name: "📋 ATTENDANCE",
    link: "/course/${id}/attendance",
  },
  {
    id: "holidays",
    name: "‍🌴 HOLIDAYS",
    link: "/course/${id}/holidays",
  },
  {
    id: "gradebook",
    name: "📚 GRADEBOOK",
    link: "/course/${id}/gradebook",
  },
  {
    id: "student-report",
    name: "👨‍🎓 STUDENT REPORT",
    link: "/course/${id}/student-report",
  },
  {
    id: "faq",
    name: "❓ FAQ",
    link: "/course/${id}/faq",
  },
];

const TeacherNavMenu = () => {
  const router = useRouter();
  const pathname = router.asPath;
  const pathNameId = pathname.split("/")[pathname.split("/").length - 1];
  const courseId = router.query.id ?? 0;
  const [active, setActive] = useState(pathname ? pathNameId : "");

  useEffect(() => {
    setActive(pathNameId);
  }, [pathname]);

  return (
    <Card className="px-4 py-2 ">
      <Nav fill pills>
        {NAV_ITEMS.map(({ name, link, id }, index) => (
          <NavItem key={`teacher-nav-${index}`}>
            <Link href={link.replace("${id}", courseId.toString())}>
              <NavLink tag="span" className={active === id ? "active" : ""}>
                {name}
              </NavLink>
            </Link>
          </NavItem>
        ))}
      </Nav>
    </Card>
  );
};

export default TeacherNavMenu;
