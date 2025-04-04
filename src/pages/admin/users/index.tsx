import React, { useState, useEffect } from 'react';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import UsersTable from '@/components/own/tables/users-table';
import UserForm from '@/components/own/form/user-form';
import { FiltersProps } from '../../../../Types/types';
import { STATUS_FILTER, USER_ROLES } from '../../../../utils/constants';
import TableFilters from '@/components/own/table-filters/table-filters';
import { getAllUsers } from '../../../../helper/api-data/user';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const Users = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  const router = useRouter();

  const limit = 20;
  const [page, setPage] = useState(1);
  const [userOptions, setUserOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usersData } = useSWR(
    ['/user/get-all', page, limit, searchTerm],
    () => getAllUsers(page, limit, searchTerm ? `name=${searchTerm}` : ''),
    {
      revalidateOnFocus: false,
    }
  );

  const onUserScrollBottom = () => {
    if (
      (usersData?.data?.result && usersData.data.result.length > 0) ||
      (usersData?.data &&
        Array.isArray(usersData.data) &&
        usersData.data.length > 0)
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    if (usersData) {
      const results = usersData.data?.result
        ? usersData.data.result
        : Array.isArray(usersData.data)
          ? usersData.data
          : [];
      if (results.length > 0) {
        const options = results.map((user: any) => ({
          label: user.name,
          value: user.name,
        }));
        setUserOptions((prevOptions) => {
          const combined = [...prevOptions, ...options];
          return combined.filter(
            (option, index, self) =>
              self.findIndex((o) => o.value === option.value) === index
          );
        });
      }
    }
  }, [usersData]);

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    setReload((prev) => !prev);
  };

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'User type',
      name: 'user_type',
      type: 'select',
      items: USER_ROLES,
    },
    {
      labelName: 'Status',
      name: 'status',
      type: 'select',
      items: STATUS_FILTER,
    },
    {
      labelName: 'Username',
      name: 'username',
      type: 'text',
    },
    {
      labelName: 'Name',
      name: 'name',
      type: 'select',
      items: userOptions,
      placeholder: 'Select user name',
      onInputChange: (inputValue: string) => {
        setSearchTerm(inputValue);
        setPage(1);
        setUserOptions([]);
      },
      onMenuScrollToBottom: onUserScrollBottom,
    },
  ];

  return (
    <div className='page-body'>
      <Container
        className='basic_table'
        fluid
      >
        <Row>
          <TableFilters selectFilters={selectFilters} />
        </Row>
        <Row>
          <Card>
            <CardHeader className='d-flex justify-content-end'>
              <TableHeaderActions
                onReload={handleReload}
                addButton={{
                  title: 'Create User',
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className='pb-4'>
              <UsersTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <UserForm
        isOpen={isOpenModal}
        toggle={toggle}
        data={null}
      />
    </div>
  );
};

export default Users;
