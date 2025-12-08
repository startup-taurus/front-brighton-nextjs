import React, { useMemo } from 'react';
import { Col, Row, Button, Label, Input } from 'reactstrap';
import { debounce } from 'lodash';
import { FaTrash } from 'react-icons/fa';
import { upsertCourseAssignmentItem } from 'helper/api-data/course';
import { toast } from 'react-toastify';

type Item = { id: number; name: string };
type Group = { professor_name: string; course_id: number; items: Item[] };

type Props = {
  groups: Group[];
  pendingDeleteIds?: Set<number>;
  setPendingTeacherDeletes?: React.Dispatch<React.SetStateAction<Array<{ course_id: number; item_id: number }>>>;
  setPendingDeleteIds?: React.Dispatch<React.SetStateAction<Set<number>>>;
};

const TeacherAssignments: React.FC<Props> = ({ groups, pendingDeleteIds = new Set(), setPendingTeacherDeletes, setPendingDeleteIds }) => {
  if (!Array.isArray(groups) || groups.length === 0) return null;
  const renameDebounced = useMemo(
    () =>
      debounce((cid: string, itemId: number, name: string) => {
        upsertCourseAssignmentItem(cid, { itemId, name }).then((res: any) => {
          if (res?.statusCode === 200 || res?.statusCode === 201) {
            toast.success('Assignment renamed');
          } else {
            toast.error(res?.message || 'Unable to rename assignment');
          }
        });
      }, 600),
    []
  );

  return (
    <Col xs={12} className='mt-4'>
      <Label>Assignments — Teachers</Label>
      <div className='syllabus-container'>
        {groups.map((grp, gi) => (
          <div key={`teacher-assignment-${gi}`} className='mb-3'>
            <strong className='d-block mb-2'>{grp.professor_name || 'Professor'}</strong>
            <Row className='mb-2'>
              {grp.items
                .filter((it) => !pendingDeleteIds.has(it.id))
                .map((it) => (
                <Col key={it.id} xs={6} className='d-flex align-items-center mb-2'>
                  <Input
                    defaultValue={it.name}
                    className='me-2 syllabus-input'
                    onChange={(e) => {
                      const newName = (e.target as HTMLInputElement).value;
                      renameDebounced(String(grp.course_id), it.id, newName);
                    }}
                  />
                  <Button
                    type='button'
                    color='danger'
                    onClick={() => {
                      setPendingTeacherDeletes?.((prev) => [
                        ...prev,
                        { course_id: grp.course_id, item_id: it.id },
                      ]);
                      setPendingDeleteIds?.((prev) => new Set(Array.from(prev).concat(it.id)));
                    }}
                  >
                    <FaTrash />
                  </Button>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </div>
    </Col>
  );
};

export default TeacherAssignments;
