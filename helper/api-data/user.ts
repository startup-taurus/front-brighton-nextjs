import { postFetcher } from "helper/api";

export const postLogin = (data: any) => {
  return postFetcher("/user/login", data, "", false, true);
};
