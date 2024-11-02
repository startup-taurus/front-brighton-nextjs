import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventSourceInput } from "@fullcalendar/core";
import { Col, Row } from "reactstrap";
import { getDayOfClassesOfWeek } from "../../../../utils/utils";

const INITIAL_EVENTS: EventSourceInput = [
  {
    id: "1",
    title: "F-16",
    start: new Date().toISOString().replace(/T.*$/, "") + "T11:00:00",
  },
  {
    id: "2",
    title: "F-16",
    start: new Date().toISOString().replace(/T.*$/, "") + "T12:00:00",
  },
];

const ScheduleCalendar = ({ courses }: any) => {
  const [daysOfClasses, setDayOfClasses] = useState<any[]>([]);

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
