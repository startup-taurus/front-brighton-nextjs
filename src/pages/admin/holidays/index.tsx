import {useState, useContext, useEffect} from 'react';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import {Alert, Card, CardHeader, Container, Row} from 'reactstrap';
import TableFilters from '@/components/own/table-filters/table-filters';
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
import { FiltersProps } from 'Types/types';
import { getFiltersString } from '../../../../utils/utils';

const Holidays = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const {user} = useContext(UserContext);
  const { userRole, permissionSet, can } = usePermission();
  const isCoordinator = user?.role === USER_TYPES.COORDINATOR;
  const canCreateHoliday = can(PERMISSIONS.CREATE_HOLIDAY);
  const allowed = can(PERMISSIONS.VIEW_HOLIDAYS);

  useEffect(() => {
    if ((userRole || permissionSet) && !allowed) {
      router.replace('/dashboard');
    }
  }, [allowed, router, userRole, permissionSet]);

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;
  const filters = getFiltersString(router);

  const {
    data: holidays,
    isLoading,
    isValidating,
  } = useSWR([`/holidays/get-all`, page, rowPerPage, filters], () =>
    getAllHolidays(page, rowPerPage, filters || undefined)
  );

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Start Date',
      name: 'start_date',
      type: 'date',
    },
    {
      labelName: 'End Date',
      name: 'end_date',
      type: 'date',
    },
  ];

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    setIsReloading(true);
    mutate([`/holidays/get-all`, page, rowPerPage, filters]).finally(() => {
      setTimeout(() => setIsReloading(false), 500);
    });
  };



  const filteredHolidays = holidays?.data;

  if (!userRole && !permissionSet) return null;

  return allowed ? (
    <div className='page-body'>
      <Container className='basic_table' fluid>
        <Row>
          <TableFilters selectFilters={selectFilters} />
        </Row>
        <Row>
          <Card>
            <CardHeader className='d-flex justify-content-end'>
              <TableHeaderActions
                onReload={handleReload}
                addButton={
                  canCreateHoliday
                    ? {
                        title: 'Create holiday',
                        onClick: () => toggle(),
                      }
                    : undefined
                }
              />
            </CardHeader>
            <div className='pb-4'>
              <HolidaysTable
                page={page}
                rowPerPage={rowPerPage}
                holidays={filteredHolidays}
                loading={isLoading || isValidating || isReloading}
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
  ) : null;
};

export default Holidays;
