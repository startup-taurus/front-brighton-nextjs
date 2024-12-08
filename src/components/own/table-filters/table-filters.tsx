import React from "react";
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

interface TableFiltersProps {
  handleCollapse: () => void;
  isOpen: boolean;
  selectFilters: FiltersProps[];
}

const TableFilters = ({
  handleCollapse,
  isOpen,
  selectFilters,
}: TableFiltersProps) => {
  const router = useRouter();
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
          <form>
            <Row>
              {selectFilters?.map((item, i) => (
                <Col
                  xs={12}
                  sm={4}
                  md={3}
                  className="mb-3"
                  key={`item-${item.value}-${i}`}
                >
                  <Label for="studentFilter">{item.labelName}</Label>
                  <Input {...item} type="select">
                    <option value="all">All</option>
                    {item?.items?.map((item, j) => (
                      <option
                        value={item.value}
                        key={`item-${item.value}-${i}`}
                      >
                        {item.label}
                      </option>
                    ))}
                  </Input>
                </Col>
              ))}
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => clearQueryString(router)}
              >
                Reset
              </button>
            </div>
          </form>
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default TableFilters;
