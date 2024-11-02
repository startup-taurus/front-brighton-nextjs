import { getFetcher, postFetcher } from "helper/api";

export const postLogin = (data: any) => {
  return postFetcher("/user/login", data, "", false, true);
};

export const createUser = (data: any) => {
  return postFetcher("/user/create", data);
};

export const getAllUsers = (page: number, limit: number) => {
  return getFetcher(`/user/get-all?page=${page}&limit=${limit}`, false);
};
