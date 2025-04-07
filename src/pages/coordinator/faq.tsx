import React from 'react';
import { Card, CardBody } from 'reactstrap';
import LogoHeader from '@/components/own/logo-header/logo-header';

const Faq = () => {
  return (
    <div className='page-body pt-2'>
      <Card className='faq'>
        <CardBody>
          <div className='mb-4'>
            <LogoHeader />
          </div>
          <div className='faq-content'>
            <h2>COORDINATOR DASHBOARD TEMPLATE (V 1.00)</h2>
            <p>
              This is a dashboard where you can find your general overview as a
              coordinator.
            </p>
            <p>
              <strong className='text-danger'>IMPORTANT:</strong> As a
              coordinator, you only have view permissions. You cannot create,
              update, or delete any information in the system.
            </p>
          </div>
          <p className='divider w-75'>
            <strong>- デイビッド</strong>
          </p>
          <div className='faq-content'>
            <h2 className='color-primary'>DASHBOARD</h2>

            <h3>❓ Q: What are my responsibilities as a coordinator?</h3>
            <p>
              As a coordinator, you can monitor courses, teachers, and students'
              progress.
            </p>
            <p>
              You can view reports and statistics but cannot modify any
              information.
            </p>

            <h3>
              ❓ Q: What do the little icons "📅", "❗" , "🏁" and "🎓" next to
              courses mean?
            </h3>
            <p>"📅" means there is a class scheduled for that day.</p>
            <p>
              "❗" icon means that the teacher hasn't updated the attendance
              list.
            </p>
            <p>"🏁" means that the course will finish in the current month.</p>
            <p>
              "🎓" means that the course has finished and therefore will not
              appear in the calendar.
            </p>

            <h3>❓ Q: Can I modify course information or student records?</h3>
            <p>
              No, as a coordinator you only have view permissions. If you need
              to make changes, please contact an administrator with the
              appropriate permissions.
            </p>

            <h3>❓ Q: How can I help teachers with their dashboard?</h3>
            <p>
              You can guide teachers on how to use their dashboard, but you
              cannot make changes on their behalf. For technical issues or data
              modifications, please refer them to the system administrator.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Faq;
