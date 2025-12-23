import React, { ReactElement, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import useSWR, { mutate } from 'swr';
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  Row,
} from 'reactstrap';
import { NextPageWithLayout } from '@/pages/_app';
import { format, parseISO } from 'date-fns';
import { UserContext } from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import TabsTeachers from '@/components/own/tabs-teachers/tabs-teachers';
import CustomTable from '@/components/own/custom-table/custom-table';
import CourseLayout from '@/components/own/course-layout/course-layout';
import { getCourseById } from '../../../../helper/api-data/course';
import { getAllActiveHolidays } from '../../../../helper/api-data/holidays';
import {
  deleteCancelledLesson,
  getCancelledLessonsByCourse,
} from '../../../../helper/api-data/cancelled-lessons';
import CancelledLessonsForm from '@/components/own/form/cancelled-lessons-form';
import { ImgPath } from '../../../../utils/Constant';
import { FaPencil, FaPlus, FaTrash } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { USER_TYPES, COURSE_TAB_NAMES, PERMISSION_TOOLTIPS } from 'utils/constants';

 

const TeachersHolidays: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const { user } = useContext(UserContext);
  const { canPermission } = usePermission();
  const isCoordinator = user?.role === USER_TYPES.COORDINATOR;
  const isReceptionist = user?.role === USER_TYPES.RECEPTIONIST;
  const canCreateCancelled = canPermission(PERMISSIONS.CREATE_CANCELLED_LESSON);
  const canEditCancelled = canPermission(PERMISSIONS.EDIT_CANCELLED_LESSON);
  const canDeleteCancelled = canPermission(PERMISSIONS.VIEW_CANCELLED_LESSONS);
  const canViewHolidays = canPermission(PERMISSIONS.VIEW_HOLIDAYS);

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId)
  );
  const holidays = useSWR(`/holidays/get-all-active`, () =>
    getAllActiveHolidays()
  );
  const cancelledLessons = useSWR(
    courseId ? `/cancelled-lesson/get-all-by-course/${courseId}` : null,
    () => getCancelledLessonsByCourse(courseId)
  );

  const holidayCols = [
    {
      name: 'DATE',
      selector: (row: { holiday_date: string }) =>
        format(parseISO(row.holiday_date), 'ccc, LLL dd'),
    },
    {
      name: 'FESTIVITY',
      selector: (row: { holiday_name: string }) => row.holiday_name,
    },
  ];

  const cancelClassesCols = [
    {
      name: 'DATE',
      selector: (row: { cancel_date: string }) =>
        format(parseISO(row.cancel_date), 'ccc, LLL dd'),
    },
    {
      name: 'REASON',
      selector: (row: { cancel_reason: string }) => row.cancel_reason,
    },
    {
      name: 'ACTIONS',
      cell: (row: any) => (
        <ButtonGroup>
          <Button
            color='danger'
            onClick={() => deleteRow(row)}
            disabled={!canDeleteCancelled}
            title={!canDeleteCancelled ? PERMISSION_TOOLTIPS.NO_PERMISSION_DELETE : PERMISSION_TOOLTIPS.DELETE_CANCELLED_LESSON}
          >
            <FaTrash />
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  const toggleModal = () => {
    if ((isCoordinator || isReceptionist) && !canCreateCancelled) {
      toast.error(
        'You do not have permission to create cancelled lessons'
      );
      return;
    }
    setIsOpenModal(() => !isOpenModal);
  };

  const deleteRow = (row: any) => {
    if (!canDeleteCancelled) {
      toast.error(
        'You do not have permission to delete cancelled lessons'
      );
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: `This action cannot be reversed!`,
      icon: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if (result.value) {
        deleteCancelledLesson(row).then(() => {
          mutate(`/cancelled-lesson/get-all-by-course/${courseId}`);
          toast.success('Cancelled class deleted!');
        });
      }
    });
  };

  if (!canViewHolidays || !courseDetail?.data?.data) return null;
  const { course_number } = courseDetail?.data?.data;

  return (
    <>
      <Card>
        <CardBody>
          <TabsTeachers
            numberOfClass={course_number}
            tabsName={COURSE_TAB_NAMES.HOLIDAYS}
          />
          <Row>
            <Col
              xs={12}
              sm={12}
              md={6}
              lg={4}
            >
              <div className='holiday-table-header'>
                <h3>UNIVERSAL LIST</h3>
              </div>
              <CustomTable
                columns={holidayCols}
                data={holidays?.data?.data}
              />
            </Col>
            <Col
              xs={12}
              sm={12}
              md={6}
              lg={4}
              className='mt-4 mt-md-0'
            >
              <div className='holiday-table-header'>
                <h3>CANCELED LESSONS</h3>
                <Button
                  onClick={toggleModal}
                  disabled={(isCoordinator || isReceptionist) && !canCreateCancelled}
                >
                  <FaPlus />
                </Button>
              </div>
              {(isCoordinator || isReceptionist) && (
                <Alert
                  color='warning'
                  className='mb-3'
                >
                  You can only view canceled lessons. You cannot modify them or add new ones.
                </Alert>
              )}
              <CustomTable
                columns={cancelClassesCols}
                data={cancelledLessons?.data?.data}
              />
            </Col>
            <Col
              xs={12}
              sm={12}
              md={6}
              lg={4}
              className='mt-4 mt-lg-0'
            >
              <div className='warning-messages'>
                <Image
                  src={`${ImgPath}/course/warning-icon.png`}
                  alt='logo'
                  width={50}
                  height={60}
                />
                <p>
                  Dates input in the <span>'CANCELED LESSONS'</span> range will
                  be removed from the attendance list.
                </p>
              </div>
              <Image
                className='w-100 holiday-decorator'
                src={`${ImgPath}/course/holiday-bg.png`}
                alt='logo'
                layout='responsive'
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