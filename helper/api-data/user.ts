import { getFetcher, postFetcher, putFetcher } from 'helper/api';
import { CheckDuplicateByRoleRequest, CheckDuplicateUserRequest } from 'Types/UserApiTypes';

export const postLogin = (data: any) => {
  return postFetcher('/user/login', data, '', false, true);
};

export const createUser = (data: any) => {
  return postFetcher('/user/register', data);
};

export const updateUser = (userId: number, data: any) => {
  return putFetcher(`/user/update/${userId}`, data);
};

export const updateStatusUser = (userId: number, status: string) => {
  return putFetcher(`/user/update-status/${userId}`, { status });
};

export const getAllUsers = (page: number, limit: number, filters?: any) => {
  return getFetcher(
    `/user/get-all?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`,
    false
  );
};

export const getDashboardData = () => {
  return getFetcher(`/user/get-dashboard-data`, false);
};

export const checkDuplicateByRole = (data: CheckDuplicateByRoleRequest) => {
  return postFetcher('/user/check-duplicate', data); 
};

export const checkDuplicateUser = (data: CheckDuplicateUserRequest) => {
  return postFetcher('/user/check-duplicate-user', data);
};
