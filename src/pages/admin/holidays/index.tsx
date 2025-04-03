import { useState, useContext } from 'react';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import { Alert, Card, CardHeader, Container, Row } from 'reactstrap';
import { UserContext } from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import HolidaysTable from '@/components/own/tables/holidays-table';
import HolidaysForm from '@/components/own/form/holidays-form';
import { toast } from 'react-toastify';
import { USER_TYPES } from 'utils/constants';
const Holidays = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  const { user } = useContext(UserContext);
  const { can } = usePermission();
  const isCoordinator = user?.role === USER_TYPES.COORDINATOR;
  const canCreateHoliday = can(PERMISSIONS.CREATE_HOLIDAY);

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    setReload(!reload);
  };

  return (
    <div className='page-body'>
      <Container
        className='basic_table'
        fluid
      >
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
              <HolidaysTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <HolidaysForm
        isOpen={isOpenModal}
        toggle={toggle}
        data={null}
      />
    </div>
  );
};

export default Holidays;
