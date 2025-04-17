import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Input,
  Label,
  Row,
} from 'reactstrap';
import Select from 'react-select';
import { FaChevronDown, FaFilter } from 'react-icons/fa6';
import { FiltersProps } from '../../../../Types/types';
import { clearQueryString } from '../../../../utils/utils';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import { Field, Formik } from 'formik';

interface TableFiltersProps {
  selectFilters: FiltersProps[];
}

const TableFilters = ({ selectFilters }: TableFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const formikRef = useRef<any>(null);

  const initialValues = selectFilters.reduce(
    (acc, field) => {
      acc[field.name] = (router.query[field.name] as string) || '';
      return acc;
    },
    {} as Record<string, string>
  );

  // Expandir automáticamente los filtros si hay parámetros en la URL
  useEffect(() => {
    const hasFilters = Object.keys(router.query).some(
      (key) =>
        key !== 'page' && key !== 'rowPerPage' && router.query[key] !== ''
    );

    if (hasFilters) {
      setIsOpen(true);
    }

    // Actualizar los valores del formulario cuando cambian los parámetros de la URL
    if (formikRef.current) {
      const currentValues = formikRef.current.values;
      let hasChanged = false;

      const newValues = { ...currentValues };

      // Actualizar los valores del formulario con los parámetros de la URL
      selectFilters.forEach((field) => {
        const urlValue = (router.query[field.name] as string) || '';
        if (currentValues[field.name] !== urlValue) {
          newValues[field.name] = urlValue;
          hasChanged = true;
        }
      });

      // Si hay cambios, actualizar el formulario
      if (hasChanged) {
        formikRef.current.setValues(newValues);
      }
    }
  }, [router.query, selectFilters]);

  const handleCollapse = () => {
    setIsOpen(!isOpen);
  };

  const clearForm = (
    resetForm: ReturnType<typeof Formik>['props']['resetForm']
  ) => {
    clearQueryString(router);
    const emptyValues = selectFilters.reduce(
      (acc, field) => {
        acc[field.name] = '';
        return acc;
      },
      {} as Record<string, string>
    );
    resetForm({ values: emptyValues });
  };

  const onSubmit = (data: any) => {
    const query = {
      ...router.query,
      ...data,
    };
    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  return (
    <Card>
      <CardHeader
        className='d-flex justify-content-between'
        onClick={handleCollapse}
      >
        <h5>Search Filters</h5>
        <button
          onClick={handleCollapse}
          className={`btn btn-link text-black p-0 ${isOpen && 'btn-collapse'}`}
        >
          <FaChevronDown />
        </button>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            innerRef={formikRef}
          >
            {({ handleSubmit, resetForm }) => (
              <form onSubmit={handleSubmit}>
                <Row>
                  {selectFilters?.map((item, i) => (
                    <Col
                      xs={12}
                      sm={4}
                      md={3}
                      className='mb-3'
                      key={`item-${item.name}-${i}`}
                    >
                      <Label for='studentFilter'>{item.labelName}</Label>
                      {item?.type === 'select' ? (
                        <Field
                          name={item.name}
                          type='select'
                        >
                          {({ field, form }: any) => (
                            <Select
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              {...field}
                              id={item.name}
                              options={item.items}
                              onChange={(selectedOption: any) => {
                                const value = selectedOption
                                  ? selectedOption.value
                                  : '';
                                form.setFieldValue(item.name, value);
                              }}
                              value={
                                item.items?.find(
                                  (option: any) => option.value === field.value
                                ) || null
                              }
                              placeholder={`Select ${item.labelName}`}
                              isSearchable
                              onInputChange={item.onInputChange}
                              onMenuScrollToBottom={item.onMenuScrollToBottom}
                              menuPortalTarget={document.body}
                            />
                          )}
                        </Field>
                      ) : item?.type === 'async-select' &&
                        item.asyncComponent ? (
                        <Field name={item.name}>
                          {(props: any) =>
                            item.asyncComponent && item.asyncComponent(props)
                          }
                        </Field>
                      ) : (
                        <Field
                          name={item.name}
                          as={Input}
                          type={item.type || 'text'}
                          id={item.name}
                          placeholder={`Search by ${item.labelName}`}
                        />
                      )}
                    </Col>
                  ))}
                </Row>
                <div className='d-flex justify-content-end gap-2'>
                  <button
                    type='button'
                    className='btn btn-outline-primary'
                    onClick={() => clearForm(resetForm)}
                  >
                    Clear
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary d-flex align-items-center gap-2'
                  >
                    <FaFilter />
                    <span>Filter</span>
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default TableFilters;
