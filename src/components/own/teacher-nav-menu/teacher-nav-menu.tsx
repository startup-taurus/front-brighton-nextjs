import React, { useEffect, useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useRouter } from "next/router";
import Link from "next/link";

const NAV_ITEMS = [
  {
    name: "🏠 HOME",
    link: "/course/${id}/home",
  },
  {
    name: "📋 ATTENDANCE",
    link: "/course/${id}/attendance",
  },
  {
    name: "‍🌴 HOLIDAYS",
    link: "/course/${id}/holidays",
  },
  {
    name: "📚 GRADEBOOK",
    link: "/course/${id}/gradebook",
  },
  {
    name: "👨‍🎓 STUDENT REPORT",
    link: "/course/${id}/student-report",
  },
  {
    name: "❓ FAQ",
    link: "/course/${id}/faq",
  },
];

const TeacherNavMenu = () => {
  const router = useRouter();
  const pathname = router.asPath;
  const courseId = router.query.id ?? 0;
  const [active, setActive] = useState(pathname ? pathname : "");

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  return (
    <Card className="px-4 py-2 ">
      <Nav fill pills>
        {NAV_ITEMS.map(({ name, link }, index) => (
          <NavItem key={`teacher-nav-${index}`}>
            <Link href={link.replace("${id}", courseId.toString())}>
              <NavLink active={active === link}>{name}</NavLink>
            </Link>
          </NavItem>
        ))}
      </Nav>
    </Card>
  );
};

export default TeacherNavMenu;
