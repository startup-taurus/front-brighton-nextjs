'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { parseISO, addDays, format, setHours, setMinutes, setSeconds, isSameDay, isAfter, isBefore } from 'date-fns';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { getCoursesForCalendar } from 'helper/api-data/course';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface Course {
  id: string;
  course_name: string;
  start_date: string;
  end_date: string;
  schedule_days: string[];
  start_time: string;
  end_time: string;
  professor_name: string;
  level_name: string;
}

const CoursesCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getCoursesForCalendar();
      
      if (response.status === "success" && response.data) {
        const calendarEvents = generateCalendarEvents(response.data);
        setEvents(calendarEvents);
      } else {
        console.log('No data or unsuccessful response:', response);
      }
    } catch (error) {
      console.error('Error fetching courses for calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarEvents = (courses: Course[]): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    

    courses.forEach((course) => {
      
      const startDate = parseISO(course.start_date);
      const endDate = parseISO(course.end_date);
      const [startHour, startMinute] = course.start_time.split(':').map(Number);
      const [endHour, endMinute] = course.end_time.split(':').map(Number);


      let currentDate = startDate;
      let eventCount = 0;
      
      while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
        const dayOfWeek = format(currentDate, 'EEEE');
        
        
        const dayMatches = course.schedule_days.some(day => 
          day.toLowerCase() === dayOfWeek.toLowerCase()
        );
        
        if (dayMatches) {
          
          const eventStart = setSeconds(
            setMinutes(
              setHours(currentDate, startHour),
              startMinute
            ),
            0
          );
          
          const eventEnd = setSeconds(
            setMinutes(
              setHours(currentDate, endHour),
              endMinute
            ),
            0
          );

          const professorText = course.professor_name && course.professor_name !== 'No asignado' 
            ? ` - ${course.professor_name}` 
            : '';
          
          events.push({
            id: `${course.id}-${format(currentDate, 'yyyy-MM-dd')}`,
            title: `${course.course_name}${professorText}`,
            start: eventStart,
            end: eventEnd,
            resource: {
              course,
              level: course.level_name,
              professor: course.professor_name,
            },
          });
          
          eventCount++;
        }
        
        currentDate = addDays(currentDate, 1);
        
        if (eventCount > 1000) {
          console.warn('Too many events generated, breaking loop');
          break;
        }
      }
      
    });

    return events;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h5>Courses Calendar</h5>
        </CardHeader>
        <CardBody>
          <div className="text-center">Loading calendar...</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h5>Courses Calendar</h5>
        <p className="text-muted mb-0">View all scheduled courses</p>
      </CardHeader>
      <CardBody>
        <div style={{ height: '600px' }}>
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
              textColor: '#ffffff'
            }))}
            height="100%"
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            eventClick={(info) => {
              const event = events.find(e => e.id === info.event.id);
              const course = event?.resource?.course;
              const professor = event?.resource?.professor;
              
              alert(`Curso: ${course?.course_name}\nProfesor: ${professor || 'No asignado'}\nHorario: ${info.event.start?.toLocaleTimeString()} - ${info.event.end?.toLocaleTimeString()}\nNivel: ${event?.resource?.level || 'No asignado'}`);
            }}
            eventContent={(eventInfo) => {
              const timeStart = eventInfo.event.start?.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              const timeEnd = eventInfo.event.end?.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              
              return (
                <div style={{ 
                  padding: '2px 4px', 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.2'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    marginBottom: '1px'
                  }}>
                    {timeStart} - {timeEnd}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    opacity: 0.95,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {eventInfo.event.title}
                  </div>
                </div>
              );
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default CoursesCalendar;