import React, { useState, useEffect, useCallback } from 'react';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import UsersTable from '@/components/own/tables/users-table';
import UserForm from '@/components/own/form/user-form';
import { FiltersProps } from '../../../../Types/types';
import { STATUS_FILTER, USER_ROLES } from '../../../../utils/constants';
import TableFilters from '@/components/own/table-filters/table-filters';
import { getAllUsers } from '../../../../helper/api-data/user';
import useSWR from 'swr';
import { SelectOption } from 'Types/SelectType';

const Users = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);

  const limit = 10;
  const [userPage, setUserPage] = useState(1);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [userOptions, setUserOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nameFilter, setNameFilter] = useState<SelectOption | null>(null);

  useEffect(() => {
    setUserOptions([]);
    setUserPage(1);
    setHasMoreUsers(true);
  }, [searchTerm]);

  const { data: usersData, isLoading } = useSWR(
    ['/user/get-all', userPage, limit, searchTerm],
    () => getAllUsers(userPage, limit, searchTerm ? `name=${searchTerm}` : '')
  );

  useEffect(() => {
    if (!searchTerm && userPage === 1) {
      getAllUsers(1, 30, '').then((data) => {
        if (data?.data?.result) {
          const initialOptions = data.data.result.map((user: any) => ({
            label: user.name,
            value: user.name,
          }));
          setUserOptions(initialOptions);
        }
      });
    }
  }, []);

  const onUserScrollToBottom = useCallback(() => {
    if (
      !loadingMoreUsers &&
      hasMoreUsers &&
      usersData?.data?.result?.length !== 0
    ) {
      setLoadingMoreUsers(true);
      setUserPage((prev) => prev + 1);
    }
  }, [loadingMoreUsers, hasMoreUsers, usersData]);

  useEffect(() => {
    if (usersData) {
      setLoadingMoreUsers(false);

      const results = Array.isArray(usersData.data)
        ? usersData.data
        : usersData.data.result || [];

      if (results.length === 0) {
        setHasMoreUsers(false);
        return;
      }

      if (results.length > 0) {
        const newOptions = results.map((user: any) => ({
          label: user.name,
          value: user.name,
        }));

        setUserOptions((prev) => {
          const baseOptions = searchTerm && userPage === 1 ? [] : [...prev];
          const combined = [...baseOptions, ...newOptions];

          return combined.filter(
            (option, idx, arr) =>
              arr.findIndex((options) => options.value === option.value) === idx
          );
        });
      }
    }
  }, [usersData, searchTerm, userPage]);

  const toggle = () => setIsOpenModal((prev) => !prev);
  const handleReload = () => setReload((prev) => !prev);

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
      value: nameFilter,
      inputValue: searchTerm,
      onInputChange: (value: string) => setSearchTerm(value),
      onChange: (option) => setNameFilter(option),
      onMenuScrollToBottom: onUserScrollToBottom,
      isLoading: loadingMoreUsers,
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
                addButton={{ title: 'Create User', onClick: toggle }}
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
