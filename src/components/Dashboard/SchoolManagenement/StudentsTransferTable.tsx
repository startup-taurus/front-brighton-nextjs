import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, CardBody, Col, Table, Spinner, Alert } from 'reactstrap';
import { CommonHeader } from './AcademicPerformance/CommonHeader';
import { getFetcher } from 'helper/api';
import { StudentTransferData } from 'Types/ProfessorType';
import { ApiResponse } from 'Types/ApiResponse';
import { getApprovedTransfers } from 'helper/api-data/transfer-data';

interface ApprovedResponse {
  result: StudentTransferData[];
  totalCount: number;
}

const StudentTransferTable: React.FC = () => {
  const [page] = useState(1);
  const [limit] = useState(10);

  const {
    data: approvedTransfersResponse,
    error,
    isLoading,
  } = useSWR<ApiResponse<ApprovedResponse>>(
    ['approvedTransfersData', page, limit],
    () => getApprovedTransfers({ page, limit })
  );

  const approvedTransfers = approvedTransfersResponse?.data?.result ?? [];

  const allRows = approvedTransfers.flatMap((transfer) =>
    transfer.student_transfers.map((student) => ({ transfer, student }))
  );
  const rowsToShow = allRows.slice(0, limit);

  if (isLoading) {
    return (
      <Col
        xxl={6}
        md={7}
      >
        <Card>
          <CommonHeader title='Last Student Transfer' />
          <CardBody className='d-flex justify-content-center align-items-center'>
            <Spinner color='primary' />
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col
        xxl={6}
        md={7}
      >
        <Card>
          <CommonHeader title='Last Student Transfer' />
          <CardBody>
            <Alert color='danger'>
              Error loading student transfer data. Please try again later at.
            </Alert>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col
      xxl={6}
      md={7}
    >
      <Card>
        <CommonHeader title='Last Student Transfer' />
        <CardBody className='pt-0'>
          <Table
            responsive
            striped
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Course</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {rowsToShow.length > 0 ? (
                rowsToShow.map(({ transfer, student }, idx) => (
                  <tr key={`${transfer.id}-${student.student_id}`}>
                    <td>{idx + 1}</td>
                    <td>{student.student.user.name}</td>
                    <td>{transfer.selected_course.course_name}</td>
                    <td>{transfer.selected_level.full_level}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className='text-center'
                  >
                    No student transfers found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Col>
  );
};

export default StudentTransferTable;
