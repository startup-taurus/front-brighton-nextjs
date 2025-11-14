'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { getCoursesForCalendar } from 'helper/api-data/course';
import { generateCalendarEvents } from 'utils/utils';
import { Course } from 'Types/CalendarTypes';
import CourseDetailModal from './CourseDetailModal';

const CoursesCalendar: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courseDetail = useSWR(
    '/course/get-calendar',
    () => getCoursesForCalendar()
  );

  if (!courseDetail?.data?.data) return null;

  const courses = courseDetail.data.data;

  const events = generateCalendarEvents(courses);

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const courseId = eventId.split('-')[0];
    const course = courses.find((c: Course) => c.id.toString() === courseId);
    
    if (course) {
      setSelectedCourse(course);
      setIsModalOpen(true);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      setSelectedCourse(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h5>Courses Calendar</h5>
          <p className="text-muted mb-0">View all scheduled courses</p>
        </CardHeader>
        <CardBody>
          <div className="courses-calendar__container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              nowIndicator={true}
              events={events.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                backgroundColor: '#ff8c00', 
                borderColor: '#ff8c00',
                textColor: '#ffffff',
                classNames: ['custom-event'],
                extendedProps: {
                  courseData: event.resource?.course
                }
              }))}
              height="100%"
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              dayMaxEvents={false}
              eventClick={handleEventClick}
              eventDisplay="block"
              eventTextColor="#ffffff"
              eventBackgroundColor="#ff8c00"
              eventBorderColor="#ff8c00"
              dayCellContent={(args) => {
                return {
                  html: `<div class="courses-calendar__day-cell">${args.dayNumberText}</div>`
                };
              }}
            />
          </div>
        </CardBody>
      </Card>

      <CourseDetailModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        selectedCourse={selectedCourse}
      />
    </>
  );
};

export default CoursesCalendar;