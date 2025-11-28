import React, { useState, useEffect, useCallback } from 'react';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import UsersTable from '@/components/own/tables/users-table';
import UserForm from '@/components/own/form/user-form';
import { FiltersProps } from '../../../../Types/types';
import { STATUS_FILTER, USER_ROLES } from '../../../../utils/constants';
import TableFilters from '@/components/own/table-filters/table-filters';
import { getAllUsers } from '../../../../helper/api-data/user';
import useSWR, { mutate } from 'swr';
import { SelectOption } from 'Types/SelectType';
import { useRouter } from 'next/router';
import { getFiltersString } from '../../../../utils/utils';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

const Users = () => {
  const { can } = usePermission();
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const limit = 10;

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage ? Number(router.query.rowPerPage) : 10;
  const filters = getFiltersString(router);

  const [userOptions, setUserOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nameFilter, setNameFilter] = useState<SelectOption | null>(null);

  const key = `/user/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`;
  const { data: usersData, isLoading } = useSWR(
    [key],
    () => getAllUsers(page, rowPerPage, filters)
  );

  const [userPage, setUserPage] = useState(1);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  useEffect(() => {
    setUserOptions([]);
    setUserPage(1);
    setHasMoreUsers(true);
  }, [searchTerm]);

  const { data: filterUsersData } = useSWR(
    ['/user/get-all-filter', userPage, limit, searchTerm],
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
      filterUsersData?.data?.result?.length !== 0
    ) {
      setLoadingMoreUsers(true);
      setUserPage((prev) => prev + 1);
    }
  }, [loadingMoreUsers, hasMoreUsers, filterUsersData]);

  useEffect(() => {
    if (filterUsersData) {
      setLoadingMoreUsers(false);

      const results = Array.isArray(filterUsersData.data)
        ? filterUsersData.data
        : filterUsersData.data.result || [];

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
  }, [filterUsersData, searchTerm, userPage]);

  const toggle = () => setIsOpenModal((prev) => !prev);
  const handleReload = async () => {
    setIsReloading(true);
    try {
      await mutate([key]);
    } finally {
      setTimeout(() => {
        setIsReloading(false);
      }, 500);
    }
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
                addButton={
                  can(PERMISSIONS.CREATE_USER)
                    ? { title: 'Create User', onClick: toggle }
                    : undefined
                }
              />
            </CardHeader>
            <div className='pb-4'>
              <UsersTable 
                users={usersData}
                page={page}
                rowPerPage={rowPerPage}
                filters={filters}
                loading={isLoading || isReloading}
              />
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
