import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { Card } from "reactstrap";

const tabsName = "HOLIDAYS";
const numberOfClass = "F-16°";
const TeachersHolidays = () => {
  return (
    <div className="page-body pt-2">
      <TabsTeachers numberOfClass={numberOfClass} tabsName={tabsName} />
 
    </div>
  );
};

export default TeachersHolidays;