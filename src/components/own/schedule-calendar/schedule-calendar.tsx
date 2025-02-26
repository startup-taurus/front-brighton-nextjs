import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Col, Row } from "reactstrap";
import { getDayOfClassesOfWeek } from "../../../../utils/utils";

const ScheduleCalendar = ({ courses }: any) => {
  const [daysOfClasses, setDayOfClasses] = useState<any[]>([]);

  console.log(courses);
  useEffect(() => {
    const schedule = getDayOfClassesOfWeek(courses);
    setDayOfClasses(schedule);
  }, [courses]);

  if (!courses || courses?.length === 0) return null;
  if (!daysOfClasses || daysOfClasses?.length === 0) return null;

  return (
    <div>
      <h2 className="main-title mb-4">Calendar</h2>
      <Row>
        <Col xs={12} lg={12}>
          <FullCalendar
            plugins={[timeGridPlugin]}
            headerToolbar={{
              left: "",
              center: "title",
              right: "",
            }}
            initialView="timeGridWeek"
            weekends={true}
            expandRows={false}
            allDaySlot={false}
            nowIndicator={true}
            initialEvents={daysOfClasses}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            height="auto"
          />
        </Col>
      </Row>
    </div>
  );
};

export default ScheduleCalendar;
