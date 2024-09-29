import React from "react";
import { Card, CardBody } from "reactstrap";
import LogoHeader from "@/components/own/logo-header/logo-header";

const Faq = () => {
  return (
    <div className="page-body pt-2">
      <Card className="faq">
        <CardBody>
          <div className="mb-4">
            <LogoHeader />
          </div>{" "}
          <div className="faq-content">
            <h2>TEACHER DASHBOARD TEMPLATE (V 1.01)</h2>
            <p>This is a dashboard where you can find your general overview.</p>
            <p>
              It's something new and experimental, but I hope it proves to be
              useful nevertheless!
            </p>
          </div>
          <p className="divider w-75">
            <strong>- デイビッド</strong>
          </p>
          <div className="faq-content">
            <h2 className="color-primary">DASHBOARD</h2>

            <h3>
              ❓ Q: What do the little icons "📅", "❗" , "🏁" and "🎓" next to
              my course mean?
            </h3>
            <p>"📅" means you have that class the same day.</p>
            <p>
              "❗" icon means that you haven't updated your attendance list.
            </p>
            <p>
              "🏁" means that your course will finish in that current month.{" "}
            </p>
            <p>
              "🎓" means that your course has finished and therefore will not
              appear in the calendar.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Faq;
