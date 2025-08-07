import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import { Field, Formik } from 'formik';

interface TableFiltersProps {
  selectFilters: FiltersProps[];
}

const TableFilters = ({ selectFilters }: TableFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const formikRef = useRef<any>(null);

  const initialValues = useMemo(() => {
    return selectFilters.reduce(
      (acc, field) => {
        const propVal =
          typeof field.value === 'object' && field.value !== null
            ? String((field.value as { value: any }).value)
            : (field.value ?? '');
        acc[field.name] = propVal || (router.query[field.name] as string) || '';
        return acc;
      },
      {} as Record<string, string>
    );
  }, [router.query]);

  useEffect(() => {
    const queryKeys = Object.keys(router.query);
    if (queryKeys.length === 1 && queryKeys.includes('id')) {
      return;
    }

    const hasFilters = queryKeys.some(
      (key) =>
        key !== 'page' &&
        key !== 'rowPerPage' &&
        key !== 'id' &&
        router.query[key] !== ''
    );

    if (hasFilters) {
      setIsOpen(true);
    }

    if (formikRef.current) {
      const currentValues = formikRef.current.values;
      let hasChanged = false;
      const newValues = { ...currentValues };

      selectFilters.forEach((field) => {
        const urlValue = (router.query[field.name] as string) || '';
        if (currentValues[field.name] !== urlValue) {
          newValues[field.name] = urlValue;
          hasChanged = true;
        }
      });

      if (hasChanged) {
        formikRef.current.setValues(newValues);
      }
    }
  }, [router.query]);

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
    selectFilters.forEach((field) => {
      field.onChange?.(null);
      field.onInputChange?.('');
    });
  };

  const onSubmit = (_: any) => {
    const query: Record<string, string> = {};
    Object.keys(router.query).forEach((key) => {
      if (
        key !== 'page' &&
        key !== 'rowPerPage' &&
        !selectFilters.some((filter) => filter.name === key)
      ) {
        query[key] = router.query[key] as string;
      }
    });

    selectFilters.forEach((field) => {
      if (
        field.type === 'select' &&
        field.value &&
        typeof field.value === 'object'
      ) {
        query[field.name] = String((field.value as { value: any }).value);
        return;
      }
      const val = formikRef.current?.values[field.name];
      if (val) {
        query[field.name] = String(val).trim();
        
      }
    });

    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  return (
    <Card>
      <CardHeader
        className='d-flex justify-content-between rounded-4 p-3'
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
            enableReinitialize
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
                              inputValue={item.inputValue}
                              value={
                                item.value
                                  ? item.value
                                  : field.value && item.items
                                    ? item.items.find(
                                        (opt: any) =>
                                          String(opt.value) ===
                                          String(field.value)
                                      )
                                    : null
                              }
                              onChange={(selectedOption: any) => {
                                const value = selectedOption
                                  ? selectedOption.value
                                  : '';
                                form.setFieldValue(item.name, value, false);
                                if (item.onChange) {
                                  item.onChange(selectedOption);
                                }
                              }}
                              placeholder={`Select ${item.labelName}`}
                              isSearchable
                              onInputChange={(inputValue) => {
                                if (item.onInputChange) {
                                  item.onInputChange(inputValue);
                                }
                              }}
                              onMenuScrollToBottom={item.onMenuScrollToBottom}
                              menuPortalTarget={document.body}
                              menuPosition='fixed'
                              menuPlacement='auto'
                              classNamePrefix='select'
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
