import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventSourceInput } from "@fullcalendar/core";
import { Col, Row } from "reactstrap";
import Image from "next/image";
import { ImgPath } from "utils/Constant";

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

const ScheduleCalendar = () => {
  return (
    <div>
      <h2 className="main-title mb-4">Calendar</h2>
      <Row>
        <Col xs={12} lg={8}>
          <FullCalendar
            plugins={[timeGridPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridWeek",
            }}
            initialView="timeGridWeek"
            weekends={true}
            expandRows={false}
            allDaySlot={false}
            nowIndicator={true}
            initialEvents={INITIAL_EVENTS}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            height="auto"
          />
        </Col>
        <Col xs={0} lg={4}>
          <Image
            src={`${ImgPath}/own/team-bg.png`}
            alt="image team"
            quality={100}
            layout="fill"
            fill={true}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ScheduleCalendar;
