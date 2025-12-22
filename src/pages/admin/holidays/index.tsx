import {useState, useContext} from 'react';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import {Alert, Card, CardHeader, Container, Row} from 'reactstrap';
import {UserContext} from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import {PERMISSIONS} from '../../../../utils/permissions';
import HolidaysTable from '@/components/own/tables/holidays-table';
import HolidaysForm from '@/components/own/form/holidays-form';
import {toast} from 'react-toastify';
import {USER_TYPES} from 'utils/constants';
import useSWR, {mutate} from 'swr';
import {useRouter} from 'next/router';
import {getAllHolidays} from '../../../../helper/api-data/holidays';

const Holidays = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const {user} = useContext(UserContext);
  const {canPermission} = usePermission();
  const isCoordinator = user?.role === USER_TYPES.COORDINATOR;
  const canCreateHoliday = canPermission(PERMISSIONS.CREATE_HOLIDAY);

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const {
    data: holidays,
    isLoading,
    isValidating,
  } = useSWR([`/holidays/get-all`, page, rowPerPage], () =>
    getAllHolidays(page, rowPerPage)
  );

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    mutate([`/holidays/get-all`, page, rowPerPage]);
  };

  return (
    <div className='page-body'>
      <Container className='basic_table' fluid>
        <Row>
          <Card>
            <CardHeader className='d-flex justify-content-end'>
              <TableHeaderActions
                onReload={handleReload}
                addButton={{
                  title: 'Create holiday',
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className='pb-4'>
              <HolidaysTable
                page={page}
                rowPerPage={rowPerPage}
                holidays={holidays?.data}
                loading={isLoading || isValidating}
              />
            </div>
          </Card>
        </Row>
      </Container>
      <HolidaysForm
        isOpen={isOpenModal}
        toggle={toggle}
        data={null}
        onReload={handleReload}
      />
    </div>
  );
};

export default Holidays;
