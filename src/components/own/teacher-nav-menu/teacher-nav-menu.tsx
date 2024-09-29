import React, { useEffect, useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useRouter } from "next/router";
import Link from "next/link";

const NAV_ITEMS = [
  {
    name: "🏠 HOME",
    link: "/course/home",
  },
  {
    name: "📋 ATTENDANCE",
    link: "/course/attendance",
  },
  {
    name: "‍🌴 HOLIDAYS",
    link: "/course/holidays",
  },
  {
    name: "📚 GRADEBOOK",
    link: "/course/gradebook",
  },
  {
    name: "👨‍🎓 STUDENT REPORT",
    link: "/course/student-report",
  },
  {
    name: "❓ FAQ",
    link: "/course/faq",
  },
];

const TeacherNavMenu = () => {
  const router = useRouter();
  const pathname = router.asPath;
  const [active, setActive] = useState(pathname ? pathname : "");

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  return (
    <Card className="px-4 py-2 ">
      <Nav fill pills>
        {NAV_ITEMS.map(({ name, link }, index) => (
          <NavItem key={`teacher-nav-${index}`}>
            <Link href={link}>
              <NavLink active={active === link}>{name}</NavLink>
            </Link>
          </NavItem>
        ))}
      </Nav>
    </Card>
  );
};

export default TeacherNavMenu;
