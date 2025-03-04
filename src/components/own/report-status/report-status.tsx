import React from "react";

const ReportStatus = ({ field, status, statusPercentage }: any) => {
  return (
    <div className="attendance-resume d-flex flex-column flex-md-row align-items-start align-items-center-md justify-content-between gap-2">
      <div className="d-flex align-items-center">
        <p className="field-description-small">{field}</p>
        <p className="field-value-small">{statusPercentage}</p>
      </div>
      <p
        className={`field-status-small ${`result-${status?.split(" ")[0].toLowerCase()}`}`}
      >
        {status}
      </p>
    </div>
  );
};

export default ReportStatus;
