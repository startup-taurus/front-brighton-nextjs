import React from "react";

const ReportStatus = ({ field, status, statusPercentage }: any) => {
  return (
    <div className={`attendance-resume `}>
      <p className="field-description-small">{field}</p>
      <p className="field-value-small">{statusPercentage}</p>
      <p
        className={`field-status-small ${`result-${status?.split(" ")[0].toLowerCase()}`}`}
      >
        {status}
      </p>
    </div>
  );
};

export default ReportStatus;
