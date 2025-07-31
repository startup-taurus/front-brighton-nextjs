'use client';
import React from 'react';
import useSWR from 'swr';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { getCoursesForCalendar } from 'helper/api-data/course';
import { generateCalendarEvents, formatEventTime } from 'utils/utils';

const CoursesCalendar: React.FC = () => {
  const courseDetail = useSWR(
    '/course/get-calendar',
    () => getCoursesForCalendar()
  );

  if (!courseDetail?.data?.data) return null;

  const courses = courseDetail?.data?.data;
  const events = generateCalendarEvents(courses);

  return (
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
            events={events.map(event => ({
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              backgroundColor: '#ff8c00', 
              borderColor: '#ff8c00',
              textColor: '#ffffff',
              classNames: ['custom-event']
            }))}
            height="100%"
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            dayMaxEvents={false} 
            dayCellContent={(args) => {
              return {
                html: `<div class="courses-calendar__day-cell">${args.dayNumberText}</div>`
              };
            }}
            eventContent={(eventInfo) => {
              const timeStart = formatEventTime(eventInfo.event.start);
              const timeEnd = formatEventTime(eventInfo.event.end);
              
              const isMonthView = eventInfo.view.type === 'dayGridMonth';
              
              if (isMonthView) {
                return {
                  html: `
                    <div class="courses-calendar__event--month" style="background-color: #ff8c00; color: white; padding: 4px 6px; border-radius: 4px; width: 100%; height: 100%;">
                      <div class="courses-calendar__event--month-time" style="font-size: 11px; font-weight: bold; color: white;">
                        ${timeStart}-${timeEnd}
                      </div>
                      <div class="courses-calendar__event--month-title" style="font-size: 10px; color: white;">
                        ${eventInfo.event.title}
                      </div>
                    </div>
                  `
                };
              } else {
                return {
                  html: `
                    <div class="courses-calendar__event--week" style="background-color: #ff8c00; color: white; padding: 2px 4px; border-radius: 3px; width: 100%; height: 100%;">
                      <div class="courses-calendar__event--week-time" style="font-size: 12px; font-weight: bold; color: white;">
                        ${timeStart} - ${timeEnd}
                      </div>
                      <div class="courses-calendar__event--week-title" style="font-size: 10px; color: white;">
                        ${eventInfo.event.title}
                      </div>
                    </div>
                  `
                };
              }
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default CoursesCalendar;