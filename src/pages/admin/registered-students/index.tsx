import React, { useState } from "react";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import { Card, CardHeader, Container, Row } from "reactstrap";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import StudentForm from "@/components/own/form/student-form";
import { FiltersProps } from "../../../../Types/types";
import TableFilters from "@/components/own/table-filters/table-filters";
import { getFiltersString } from "../../../../utils/utils";
import { getAllRegisteredStudents } from "../../../../helper/api-data/registered-student";
import {
  LEVEL_FILTER,
  LEVELS_FOR_ADULTS,
  LEVELS_FOR_KIDS,
  PROMOTION_FILTER,
  STATUS_FILTER,
} from "../../../../utils/constants";
import StudentsRegisteredTable from "@/components/own/tables/students-registered-table";

const Students = () => {
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const filters = getFiltersString(router);

  const students = useSWR(
    [
      `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
    ],
    () => getAllRegisteredStudents(page, rowPerPage, filters),
  );

  const selectFilters: FiltersProps[] = [
    {
      labelName: "Level",
      name: "level",
      type: "select",
      items: [...LEVELS_FOR_KIDS, ...LEVELS_FOR_ADULTS],
    },
  ];

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    mutate([
      `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
    ]);
  };

  return (
    <div className="page-body">
      <Container className="basic_table" fluid>
        <Row>
         <TableFilters selectFilters={selectFilters} />
        </Row>
        <Row>
          <Card>
            <CardHeader className="d-flex justify-content-end">
              <TableHeaderActions onReload={handleReload} />
            </CardHeader>
            <div className="pb-4">
              <StudentsRegisteredTable
                page={page}
                rowPerPage={rowPerPage}
                students={students?.data}
                filters={filters}
              />
            </div>
          </Card>
        </Row>
      </Container>
    </div>
  );
};

export default Students;
