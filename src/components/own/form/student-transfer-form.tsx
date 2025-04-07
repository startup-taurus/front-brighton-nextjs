import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  Button,
  Col,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
} from 'reactstrap';
import useSWR, { mutate } from 'swr';
import { getActiveCourses } from 'helper/api-data/course';
import { toast } from 'react-toastify';
import LoadingButton from '../common/loading-button/LoadingButton';
import { transferStudents } from 'helper/api-data/student';

interface StudentTransferFormProps {
  isOpen: boolean;
  toggle: () => void;
  students: any[];
  isGroupTransfer?: boolean;
  onSuccess?: (courseId: string) => void;
}

const StudentTransferForm: React.FC<StudentTransferFormProps> = ({
  isOpen,
  toggle,
  students,
  isGroupTransfer = false,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseOptions, setCourseOptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Obtener los cursos activos
  const { data: coursesData } = useSWR(
    ['/course/get-active', page, limit, searchTerm],
    () => getActiveCourses(page, limit, searchTerm)
  );

  useEffect(() => {
    if (coursesData?.data) {
      // La API devuelve los datos directamente en data, no en data.result
      const options = coursesData.data.map((course: any) => ({
        value: course.id,
        label: `${course.course_number} - ${course.course_name}`,
        // Si no hay level en la API, usamos un valor por defecto o lo extraemos del nombre del curso
        level:
          course.syllabus_id === 1
            ? 'A1'
            : course.syllabus_id === 2
              ? 'A2'
              : course.syllabus_id === 3
                ? 'B1'
                : 'Unknown',
      }));
      setCourseOptions(options);
    }
  }, [coursesData]);

  // Filtrar cursos por nivel si es traspaso individual
  // Como no tenemos información de nivel directamente, usamos todos los cursos disponibles
  const filteredCourseOptions = courseOptions;

  const getNextLevel = (currentLevel: string): string => {
    // Lógica para determinar el siguiente nivel
    // Ejemplo: A1 -> A2, A2 -> B1, etc.
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);
    if (currentIndex !== -1 && currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    return currentLevel;
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    setIsLoading(true);

    try {
      const studentIds = students.map((student) => student.id);

      // Llamar a la API para realizar el traspaso usando el endpoint de actualización
      const response = await transferStudents(studentIds, selectedCourse.value);

      if (response.statusCode === 200) {
        toast.success(
          `${students.length} student(s) transferred successfully to ${selectedCourse.label}`
        );

        if (onSuccess) {
          onSuccess(selectedCourse.value);
        }

        toggle();
      } else {
        toast.error('Error transferring students: ' + response.message);
      }
    } catch (error) {
      console.error('Error transferring students:', error);
      toast.error('Error transferring students');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      size='lg'
    >
      <ModalHeader toggle={toggle}>
        {isGroupTransfer ? 'Group Transfer' : 'Individual Transfer'}
      </ModalHeader>
      <ModalBody>
        <Form>
          <Row>
            <Col md='12'>
              <h5>Students to Transfer ({students.length})</h5>
              <ul className='list-group mb-4'>
                {students.map((student) => (
                  <li
                    key={student.id}
                    className='list-group-item d-flex justify-content-between align-items-center'
                  >
                    <div>
                      <strong>{student.user.name}</strong>
                      <div className='text-muted small'>
                        Current Level: {student.level} | Current Course:{' '}
                        {student.course[0]?.course_number || 'None'}
                      </div>
                    </div>
                    <span
                      className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                    >
                      {student.status.charAt(0).toUpperCase() +
                        student.status.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </Col>

            <Col md='12'>
              <FormGroup>
                <Label for='course'>Select Destination Course</Label>
                <Select
                  id='course'
                  name='course'
                  options={filteredCourseOptions}
                  value={selectedCourse}
                  onChange={(option) => setSelectedCourse(option)}
                  onInputChange={(value) => setSearchTerm(value)}
                  placeholder='Search for a course...'
                  isClearable
                  isSearchable
                  className='basic-single'
                  classNamePrefix='select'
                />
                {isGroupTransfer && (
                  <small className='text-muted'>
                    Group transfer requires at least 5 students from the same
                    level
                  </small>
                )}
                {!isGroupTransfer && (
                  <small className='text-muted'>
                    Individual transfer allows moving to the same level or next
                    level
                  </small>
                )}
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color='secondary'
          onClick={toggle}
        >
          Cancel
        </Button>
        <LoadingButton
          color='primary'
          onClick={handleSubmit}
          loading={isLoading}
        >
          Transfer Students
        </LoadingButton>
      </ModalFooter>
    </Modal>
  );
};

export default StudentTransferForm;
