import React, { useMemo, useEffect } from 'react';
import { FieldArray } from 'formik';
import { Button, Col, Row, Input, Label } from 'reactstrap';
import { FaTrash } from 'react-icons/fa';

type ArrayProps = {
  name: string;
  label: string;
  values: any;
  setFieldValue: (field: string, value: any) => void;
};

export const ArrayStringField: React.FC<ArrayProps> = ({ name, label, values, setFieldValue }) => {
  const fieldValue = values[name as keyof typeof values] as string[];
  const safeArray = Array.isArray(fieldValue) && fieldValue.length > 0 ? fieldValue : [''];

  return (
    <Col xs={12} className='mt-3'>
      <Label>{label}</Label>
      <FieldArray
        name={name}
        render={(arrayHelpers) => (
          <>
            <div className='d-flex justify-content-start my-2'>
              <Button type='button' color='primary' onClick={() => arrayHelpers.push('')}>
                Add Item
              </Button>
            </div>
            <div className='syllabus-container'>
              <Row className='mb-2'>
                {safeArray.map((item, index) => (
                  <Col key={index} xs={6} className='d-flex align-items-center mb-2'>
                    <Input
                      value={item}
                      onChange={(e) => setFieldValue(`${name}[${index}]`, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                      className='me-2 syllabus-input'
                    />
                    <Button
                      type='button'
                      color='danger'
                      onClick={() => {
                        if (safeArray.length === 1) {
                          setFieldValue(`${name}[0]`, '');
                        } else {
                          arrayHelpers.remove(index);
                        }
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>
          </>
        )}
      />
    </Col>
  );
};

type PercentProps = {
  name: string;
  label: string;
  values: any;
  setFieldValue: (field: string, value: any) => void;
};

export const PercentagesField: React.FC<PercentProps> = ({ name, label, values, setFieldValue }) => {
  return (
    <Col xs={12} className='mt-3'>
      <Label>{label}</Label>
      <FieldArray
        name={name}
        render={(arrayHelpers) => (
          <>
            <div className='d-flex justify-content-start my-2'>
              <Button type='button' color='primary' onClick={() => arrayHelpers.push({ name: '', min: 0, max: 0 })}>
                Add Percentage
              </Button>
            </div>
            <div className='syllabus-container'>
              {values[name].map((percentage: any, index: number) => (
                <Row key={index} className='mb-2 align-items-center'>
                  <Col md={4}>
                    <Label>Name</Label>
                    <Input
                      type='text'
                      value={percentage.name}
                      onChange={(e) => setFieldValue(`${name}[${index}].name`, e.target.value)}
                      className='syllabus-input'
                    />
                  </Col>
                  <Col md={3}>
                    <Label>Min %</Label>
                    <Input
                      type='number'
                      value={percentage.min}
                      onChange={(e) => setFieldValue(`${name}[${index}].min`, e.target.value)}
                      className='syllabus-input'
                    />
                  </Col>
                  <Col md={3}>
                    <Label>Max %</Label>
                    <Input
                      type='number'
                      value={percentage.max}
                      onChange={(e) => setFieldValue(`${name}[${index}].max`, e.target.value)}
                      className='syllabus-input'
                    />
                  </Col>
                  <Col md={2} className='d-flex align-items-end'>
                    <Button type='button' color='danger' onClick={() => arrayHelpers.remove(index)}>
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          </>
        )}
      />
    </Col>
  );
};

type Group = { professor_name: string; course_id: number; items: Array<{ id: number; name: string }>; };

type SanitizerProps = {
  teacherGroups: Group[];
  assignments: string[];
  setFieldValue: (field: string, value: any) => void;
};

export const AssignmentsSanitizer: React.FC<SanitizerProps> = ({ teacherGroups, assignments, setFieldValue }) => {
  const teacherItemNames = useMemo(() => {
    const names: string[] = [];
    const list = Array.isArray(teacherGroups) ? teacherGroups : [];
    list.forEach((grp) => grp.items.forEach((it) => names.push(String(it.name || '').toLowerCase().trim())));
    return new Set(names);
  }, [teacherGroups]);

  useEffect(() => {
    const current = Array.isArray(assignments) ? assignments : [];
    const filtered = current.filter((n) => !teacherItemNames.has(String(n || '').toLowerCase().trim()));
    if (filtered.length !== current.length) {
      setFieldValue('assignments', filtered);
    }
  }, [teacherItemNames, assignments, setFieldValue]);

  useEffect(() => {
    const arr = Array.isArray(assignments) ? assignments : [];
    const seen = new Set<string>();
    const normalized = (s: any) => String(s || '').toLowerCase().trim();
    const next: string[] = [];
    for (const n of arr) {
      const key = normalized(n);
      if (key === '') {
        next.push(n as string);
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(n as string);
    }
    if (next.length !== arr.length) {
      setFieldValue('assignments', next);
    }
  }, [assignments, setFieldValue]);

  return null;
};

