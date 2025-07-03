import axios from "axios";
import { handleError } from "../utils/utils";
import { toast } from "react-toastify";
import { SUCCESS_MESSAGE } from "utils/constants";
import Cookies from "js-cookie";

const getAuthToken = (providedToken?: string): string => {
  if (providedToken) return providedToken;
  
  const tokenCookie = Cookies.get('token');
  if (tokenCookie) {
    try {
      const user = JSON.parse(tokenCookie);
      return user.token || '';
    } catch (error) {
      return '';
    }
  }
  return '';
};

export const postFetcher = (
  url: string,
  data: any,
  token?: string,
  hideError?: boolean,
  stopRedirect?: boolean,
) => {
  const authToken = getAuthToken(token);
  return axios
    .post(`${process.env.API_URL}${url}`, data, {
      headers: { authorization: `Bearer ${authToken}` },
    })
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return handleError(e, hideError, stopRedirect);
    });
};

export const patchFetcher = (url: string, data: any, token?: string) => {
  const authToken = getAuthToken(token);
  return axios
    .patch(`${process.env.API_URL}${url}`, data, {
      headers: { authorization: `Bearer ${authToken}` },
    })
    .then((res) => res.data)
    .catch((e) => {
      return handleError(e);
    });
};

export const putFetcher = (url: string, data: any, token?: string) => {
  const authToken = getAuthToken(token);
  return axios
    .put(`${process.env.API_URL}${url}`, data, {
      headers: { authorization: `Bearer ${authToken}` },
    })
    .then((res) => {
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
  stopRedirect?: boolean,
) => {
  const authToken = getAuthToken(token);
  return axios
    .get(`${process.env.API_URL}${url}`, {
      headers: { authorization: `Bearer ${authToken}` },
    })
    .then((res) => (addLevel ? res.data?.data : res.data))
    .catch((e) => {
      const hideError = e?.response?.status === 403 ? false : true;
      return handleError(e, hideError, stopRedirect);
    });
};

export const deleteFetcher = (url: string, token?: string) => {
  const authToken = getAuthToken(token);
  return axios
    .delete(`${process.env.API_URL}${url}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    .then((res) => res.data)
    .catch((e) => {
      return handleError(e);
    });
};
