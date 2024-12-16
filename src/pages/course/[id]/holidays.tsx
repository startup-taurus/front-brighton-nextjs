import React, { ReactElement, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import useSWR, { mutate } from "swr";
import { Button, ButtonGroup, Card, CardBody, Col, Row } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";
import { format, parseISO } from "date-fns";

import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import CustomTable from "@/components/own/custom-table/custom-table";
import CourseLayout from "@/components/own/course-layout/course-layout";
import { getCourseById } from "../../../../helper/api-data/course";
import { getAllActiveHolidays } from "../../../../helper/api-data/holidays";
import {
  deleteCancelledLesson,
  getCancelledLessonsByCourse,
} from "../../../../helper/api-data/cancelled-lessons";
import CancelledLessonsForm from "@/components/own/form/cancelled-lessons-form";
import { ImgPath } from "../../../../utils/Constant";
import { FaPencil, FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const tabsName = "HOLIDAYS";

const TeachersHolidays: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId),
  );
  const holidays = useSWR(`/holidays/get-all-active`, () =>
    getAllActiveHolidays(),
  );
  const cancelledLessons = useSWR(
    courseId ? `/cancelled-lesson/get-all-by-course/${courseId}` : null,
    () => getCancelledLessonsByCourse(courseId),
  );

  const holidayCols = [
    {
      name: "DATE",
      selector: (row: { holiday_date: string }) =>
        format(parseISO(row.holiday_date), "ccc, LLL dd"),
    },
    {
      name: "FESTIVITY",
      selector: (row: { holiday_name: string }) => row.holiday_name,
    },
  ];

  const cancelClassesCols = [
    {
      name: "DATE",
      selector: (row: { cancel_date: string }) =>
        format(parseISO(row.cancel_date), "ccc, LLL dd"),
    },
    {
      name: "REASON",
      selector: (row: { cancel_reason: string }) => row.cancel_reason,
    },
    {
      name: "ACTIONS",
      cell: (row: any) => (
        <ButtonGroup>
          <Button color="primary" onClick={() => onRowSelected(row)}>
            <FaPencil />
          </Button>
          <Button color="danger" onClick={() => deleteRow(row)}>
            <FaTrash />
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  const toggleModal = () => {
    setIsOpenModal(() => !isOpenModal);
  };

  const onRowSelected = (row: any) => {
    setSelectedData(() => row);
    toggleModal();
  };

  const deleteRow = (row: any) => {
    Swal.fire({
      title: "Are you sure?",
      text: `This action cannot be reversed!`,
      icon: "warning",
      showCancelButton: true,
    }).then((result) => {
      if (result.value) {
        deleteCancelledLesson(row?.id).then(() => {
          mutate(`/cancelled-lesson/get-all-by-course/${courseId}`);
          toast.success("Cancelled class deleted!");
        });
      }
    });
  };

  if (!courseDetail?.data?.data) return null;
  const { course_number } = courseDetail?.data?.data;

  return (
    <>
      <Card>
        <CardBody>
          <TabsTeachers numberOfClass={course_number} tabsName={tabsName} />
          <Row>
            <Col xs={12} sm={12} md={6} lg={4}>
              <div className="holiday-table-header">
                <h3>UNIVERSAL LIST</h3>
              </div>
              <CustomTable columns={holidayCols} data={holidays?.data?.data} />
            </Col>
            <Col xs={12} sm={12} md={6} lg={4}>
              <div className="holiday-table-header">
                <h3>CANCELED LESSONS</h3>
                <Button onClick={toggleModal}>
                  <FaPlus />
                </Button>
              </div>
              <CustomTable
                columns={cancelClassesCols}
                data={cancelledLessons?.data?.data}
              />
            </Col>
            <Col xs={12} sm={12} md={6} lg={4}>
              <div className="warning-messages">
                <Image
                  src={`${ImgPath}/course/warning-icon.png`}
                  alt="logo"
                  width={50}
                  height={60}
                />
                <p>
                  Dates input in the <span>'CANCELED LESSONS'</span> range will
                  be removed from the attendance list.
                </p>
              </div>
              <Image
                className="w-100"
                src={`${ImgPath}/course/holiday-bg.png`}
                alt="logo"
                layout="responsive"
                width={100}
                height={100}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
      <CancelledLessonsForm
        isOpen={isOpenModal}
        toggleModal={toggleModal}
        data={selectedData}
        setData={setSelectedData}
      />
    </>
  );
};

TeachersHolidays.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default TeachersHolidays;
