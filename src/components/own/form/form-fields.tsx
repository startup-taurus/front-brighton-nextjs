import React from 'react';
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
