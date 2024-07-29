import React, { useState } from "react";
import { Input, Pagination, PaginationItem, PaginationLink } from "reactstrap";

const TableFooter = ({ totalItems, setPage, setItemPerPage }: any) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="d-flex justify-content-between  pt-md-4 pb-2">
      <div>
        <Input type="select" name="select" id="exampleSelect">
          <option>10 items por página</option>
          <option>20 items por página</option>
          <option>50 items por página</option>
          <option>100 items por página</option>
        </Input>
      </div>
      <Pagination>
        <PaginationItem>
          <PaginationLink first />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink previous />
        </PaginationItem>
        <PaginationItem className="d-flex align-items-center gap-2 mx-4">
          Página
          <div>
            <Input value={1} style={{ maxWidth: "40px" }} />
          </div>
          de 4
        </PaginationItem>
        <PaginationItem>
          <PaginationLink next />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink last />
        </PaginationItem>
      </Pagination>
    </div>
  );
};

export default TableFooter;
