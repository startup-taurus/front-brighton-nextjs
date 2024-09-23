import React, { useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink } from "reactstrap";
import { useRouter } from "next/router";
import Link from "next/link";

const NAV_ITEMS = [
  {
    name: "‍🏫 DASHBOARD",
    link: "/teachers/dashboard",
  },
  {
    name: "🏠 HOME",
    link: "/teachers/home",
  },
  {
    name: "📋 ATTENDANCE",
    link: "/teachers/attendance",
  },
  {
    name: "‍🌴 HOLIDAYS",
    link: "/teachers/holidays",
  },
];

const TeacherNavMenu = () => {
  const router = useRouter();
  const pathname = router.asPath;
  const [active, setActive] = useState(pathname ? pathname : "");
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
