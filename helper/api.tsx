import axios from "axios";
import { handleError } from "../utils/utils";
import { toast } from "react-toastify";
import { SUCCESS_MESSAGE } from "utils/constants";

export const postFetcher = (
  url: string,
  data: any,
  token?: string,
  hideError?: boolean,
  stopRedirect?: boolean
) => {
  return axios
    .post(`${process.env.API_URL}${url}`, data, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => {
      toast.info(res?.data?.message ?? SUCCESS_MESSAGE);
      return res.data;
    })
    .catch((e) => {
      return handleError(e, hideError, stopRedirect);
    });
};

export const patchFetcher = (url: string, data: any, token?: string) => {
  return axios
    .patch(`${process.env.API_URL}${url}`, data, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
    .catch((e) => {
      return handleError(e);
    });
};

export const putFetcher = (url: string, data: any, token?: string) => {
  return axios
    .put(`${process.env.API_URL}${url}`, data, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => {
      toast.info(res?.data?.message ?? SUCCESS_MESSAGE);
      return res.data;
    })
    .catch((e) => {
      return handleError(e);
    });
};

export const getFetcher = (
  url: string,
  addLevel?: boolean,
  token?: string,
  stopRedirect?: boolean
) => {
  return axios
    .get(`${process.env.API_URL}${url}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => (addLevel ? res.data?.data : res.data))
    .catch((e) => {
      return handleError(e, true, stopRedirect);
    });
};
