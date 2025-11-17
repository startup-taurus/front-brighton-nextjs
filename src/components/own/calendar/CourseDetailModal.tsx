import React from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import Image from 'next/image';
import { ImgPath, UrlImage } from 'utils/Constant';
import { formatDateLocale } from 'utils/utils';
import { Course, CourseDetailModalProps } from 'Types/CalendarTypes';

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  isOpen,
  toggle,
  selectedCourse
}) => {
  const formatScheduleDays = (days: string | string[] | any) => {
    if (!days) return 'Not available';
    
    if (Array.isArray(days)) {
      return days.map(day => day.trim()).join(', ');
    }
    
    if (typeof days === 'string') {
      return days.split(',').map(day => day.trim()).join(', ');
    }
    
    return String(days);
  };

  const formatTime = (time: string) => {
    if (!time) return 'Not available';
    return time;
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='lg'
      className="course-detail-modal"
    >
      <ModalHeader toggle={toggle} className="bg-primary text-white">
        <div className="d-flex align-items-center">
          <i className="fa fa-graduation-cap me-2"></i>
          {selectedCourse?.course_name || 'Course Details'}
        </div>
      </ModalHeader>
      <ModalBody className="p-4">
        {selectedCourse && (
          <div className='project-box'>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge badge-success fs-6 px-3 py-2">
                <i className="fa fa-check-circle me-1"></i>
                Active
              </span>
            </div>

            <div className="course-header mb-4">
              <h4 className="text-primary mb-2">{selectedCourse.course_name}</h4>
              <div className="d-flex align-items-center mb-3">
                <div className="detail-card p-2 border rounded me-3">
                  <div className="d-flex align-items-center">
                    <i className="fa fa-hashtag text-primary me-2"></i>
                    <strong>Course Number:</strong>
                    <span className="text-success fw-bold ms-2">
                      {selectedCourse.course_number || 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='d-flex align-items-center'>
                <Image
                  className='me-3 rounded-circle'
                  width={40}
                  height={40}
                  src={
                    selectedCourse.professor_image 
                      ? `${UrlImage}/${selectedCourse.professor_image}` 
                      : `${ImgPath}/user/7.jpg`
                  }
                  alt='professor image'
                />
                <div>
                  <h6 className="mb-0 text-dark">{selectedCourse.professor_name || 'Not assigned'}</h6>
                  <small className="text-muted">Professor</small>
                </div>
              </div>
            </div>

            <div className='course-details'>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="detail-card p-3 border rounded">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa fa-layer-group text-primary me-2"></i>
                      <strong>Level</strong>
                    </div>
                    <span className="text-success fw-bold">
                      {selectedCourse.level_name || 'Not available'}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="detail-card p-3 border rounded">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa fa-users text-primary me-2"></i>
                      <strong>Total Students</strong>
                    </div>
                    <span className="text-info fw-bold">
                      {selectedCourse.student_count || 0}
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="detail-card p-3 border rounded">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa fa-calendar-alt text-primary me-2"></i>
                      <strong>Start Date</strong>
                    </div>
                    <span className="text-dark">
                      {selectedCourse.start_date ? 
                        formatDateLocale(selectedCourse.start_date, 'en-US') : 
                        'Not available'
                      }
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="detail-card p-3 border rounded">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa fa-calendar-check text-primary me-2"></i>
                      <strong>End Date</strong>
                    </div>
                    <span className="text-dark">
                      {selectedCourse.end_date ? 
                        formatDateLocale(selectedCourse.end_date, 'en-US') : 
                        'Not available'
                      }
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="detail-card p-3 border rounded">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa fa-calendar-week text-primary me-2"></i>
                      <strong>Class Days</strong>
                    </div>
                    <span className="text-success fw-bold">
                      {formatScheduleDays(selectedCourse.schedule_days)}
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="detail-card p-3 border rounded">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fa fa-clock text-primary me-2"></i>
                      <strong>Schedule</strong>
                    </div>
                    <span className="text-dark">
                      {formatTime(selectedCourse.start_time)} - {formatTime(selectedCourse.end_time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default CourseDetailModal;