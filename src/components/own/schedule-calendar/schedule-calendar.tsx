import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Col, Row } from 'reactstrap';
import { getDayOfClassesOfWeek } from '../../../../utils/utils';

const ScheduleCalendar = ({ courses }: any) => {
  const [daysOfClasses, setDayOfClasses] = useState<any[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const schedule = getDayOfClassesOfWeek(courses);
    setDayOfClasses(schedule);
  }, [courses]);

  if (!courses || courses?.length === 0) return null;
  if (!daysOfClasses || daysOfClasses?.length === 0) return null;

  return (
    <div>
      <h2 className='main-title mb-4'>Calendar</h2>
      <Row>
        <Col
          xs={12}
          lg={12}
        >
        </Col>
      </Row>
    </div>
  );
};

export default ScheduleCalendar;
