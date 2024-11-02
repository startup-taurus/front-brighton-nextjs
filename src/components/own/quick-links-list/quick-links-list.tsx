import Link from "next/link";
import React from "react";
import { Table } from "reactstrap";

interface LinkElement {
  title: string;
  icon: string;
  link: string;
}

interface CoursesListProps {
  title: string;
  quickLinks: LinkElement[];
  otherLinks: LinkElement[];
}

const QuickLinksList = ({
  title,
  quickLinks,
  otherLinks,
}: CoursesListProps) => {
  return (
    <div>
      <h2 className="main-title text-lg-end">{title}</h2>
      <Table className="link-list-small">
        <tbody>
          {quickLinks?.map((link, index) => (
            <tr key={`dashboard-course-${index}`}>
              <td>{link.title}</td>
              <td className="col-bg-primary ">
                <Link href={link.link} className="w-100 h-100 col-icon">
                  {link.icon}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Table className="link-list-small tertiary-bg mt-4">
        <tbody>
          {otherLinks?.map((link, index) => (
            <tr key={`dashboard-course-${index}`}>
              <td>{link.title}</td>
              <td className="col-bg-primary ">
                <a
                  href={link.link}
                  target="_blank"
                  className="w-100 h-100 col-icon"
                >
                  {link.icon}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default QuickLinksList;
