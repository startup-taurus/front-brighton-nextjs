import exp from "constants";
import { getFetcher, postFetcher, putFetcher } from "../api";
export const getAllHolidays = (page: number, limit: number) => {
  return getFetcher(`/holidays/get-all?page=${page}&limit=${limit}`, false);
};

export const createHoliday = (data: any) => {
  return postFetcher(`/holidays/create`, data);
};

export const updateHoliday = (holidaysId: number ,data: any) => {
  return putFetcher(`/holidays/update/${holidaysId}`, data);
};

export const updateHolidayStatus = (holidaysId: number, status: string) => {
  return putFetcher(`/holidays/update-status/${holidaysId}`, { status });
};
