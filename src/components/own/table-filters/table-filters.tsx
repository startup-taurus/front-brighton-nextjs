import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Input,
  Label,
  Row,
} from "reactstrap";
import { FaChevronDown, FaFilter } from "react-icons/fa6";
import { FiltersProps } from "../../../../Types/types";
import { clearQueryString } from "../../../../utils/utils";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import { Field, Formik } from "formik";

interface TableFiltersProps {
  selectFilters: FiltersProps[];
}

const TableFilters = ({ selectFilters }: TableFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const initialValues = selectFilters.reduce(
    (acc, field) => {
      acc[field.name] = (router.query[field.name] as string) || "";
      return acc;
    },
    {} as Record<string, string>,
  );

  const handleCollapse = () => {
    setIsOpen(!isOpen);
  };

  const clearForm = (resetForm: () => void) => {
    resetForm();
    clearQueryString(router);
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
        className="d-flex justify-content-between"
        onClick={handleCollapse}
      >
        <h5>Search Filters</h5>
        <button
          onClick={handleCollapse}
          className={`btn btn-link text-black p-0 ${isOpen && "btn-collapse"}`}
        >
          <FaChevronDown />
        </button>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody>
          <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ handleSubmit, resetForm }) => (
              <form onSubmit={handleSubmit}>
                <Row>
                  {selectFilters?.map((item, i) => (
                    <Col
                      xs={12}
                      sm={4}
                      md={3}
                      className="mb-3"
                      key={`item-${item.name}-${i}`}
                    >
                      <Label for="studentFilter">{item.labelName}</Label>
                      {item?.type === "select" ? (
                        <Field {...item} type="select" as={Input}>
                          <option value="">All</option>
                          {item?.items?.map((item, j) => (
                            <option
                              value={item.value}
                              key={`item-${item.value}-${i}`}
                            >
                              {item.label}
                            </option>
                          ))}
                        </Field>
                      ) : (
                        <Field {...item} type="text" as={Input} />
                      )}
                    </Col>
                  ))}
                </Row>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() => clearForm(resetForm)}
                  >
                    Reset
                  </button>
                  <button type="submit" className="btn btn-save">
                    <FaFilter /> <span>Filter</span>
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
