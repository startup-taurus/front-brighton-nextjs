import React from 'react';
import { FieldArray } from 'formik';
import { Button, Col, Row, Input, Label } from 'reactstrap';
import { FaTrash } from 'react-icons/fa';

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
}
