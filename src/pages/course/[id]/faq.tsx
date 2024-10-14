import React, { ReactElement } from "react";
import { Card, CardBody } from "reactstrap";
import CourseLayout from "@/components/own/course-layout/course-layout";
import LogoHeader from "@/components/own/logo-header/logo-header";
import { NextPageWithLayout } from "@/pages/_app";

const Faq: NextPageWithLayout = () => {
  return (
    <Card className="faq">
      <CardBody>
        <div className="mb-4">
          <LogoHeader />
        </div>
        <div className="faq-content">
          <h2>COURSE REPORT TEMPLATE (V 3.00)</h2>
          <p>This is the last major revision of the "attendance reports".</p>
          <p>
            I hope from the bottom of my heart that it is to everyone's
            convenience and enjoyment!
          </p>
        </div>
        <p className="divider w-75">
          <strong>- デイビッド</strong>
        </p>
        <div className="faq-content">
          <h2 className="color-primary my-4">ATTENDANCE</h2>
          <h3>❓ Q: How do I add/remove a student?</h3>
          <p>
            Teachers can't add or remove students. If a student should be added,
            this requirement must be manifested to the Academic Director so that
            the student is added to the main database.
          </p>

          <h3>
            ❓ Q: What do I do if a student missed a class but they recover
            later?
          </h3>
          <p>
            The letter "R" may be used for a lesson in which a student
            previously had an "F", but was recovered.
          </p>
          <h3>❓ Q: The days don't follow my schedule! How can I fix them?</h3>
          <p>
            In case the formula doesn't calculate the days properly, you should
            ask the Academic Director.
          </p>
          <h3>
            ❓ Q: My class was canceled and I need to add an extra day to the
            schedule. What do I do?
          </h3>
          <p>
            The 🌴 HOLIDAYS sheet can help you input canceled lessons so as to
            remove one day from the program and add another one.
          </p>
          <h3>
            ❓ Q: The curriculum says that I have to do a
            review/presentation/exam. Where can I find more information?
          </h3>
          <p>
            The curriculum row is a simplified visual indicator of the study
            guide for that level. If you need more details, you can check the
            full version in Google Drive.
          </p>
        </div>
        <div className="faq-content">
          <h2 className="color-primary my-4">GRADEBOOK</h2>
          <h3>❓ Q: How can I convert my scores to percentages?</h3>
          <p>Use the following formula: (Gained points / Total points) * 100</p>
          <h3>❓ Q: I need more assignment columns. How can I add more?</h3>
          <p>
            You can right click the second to last assignment name (on row 6)
            and insert a new column there.
          </p>
          <p>
            Don't do it on the last assignment, and don't do it anywhere else
            than row 6.
          </p>
          <h3>❓ Q: Where can I find the progress tests?</h3>
          <p>
            Units 1-2 and 5-6 will use the individual tests for Unit 1 and Unit
            2 (or Unit 5 and Unit 6) combined.
          </p>
          <p>
            Print one page of Unit 1's test and another of Unit 2's. More
            information about the progress tests can be found in the study
            guide.
          </p>
          <h3>❓ Q: Where can I find the final exams?</h3>
          <p>
            Exams can be found in Google Drive. Please refer to the Handbook for
            Examinations for instructions on how to administer the exams.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

Faq.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Faq;
