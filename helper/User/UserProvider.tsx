import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { initialUserState, UserContext } from "./";

interface contextType {
  children: ReactNode;
}
const UserProvider = ({ children }: contextType) => {
  const [user, setUser] = useState<any>(initialUserState);
  const router = useRouter();

  const login = (user: any) => {
    setUser(user);
  };

  const logout = () => {
    setUser({ id: 0 });
    router.push("/authentication/login");
  };

  const value = {
    user,
    login,
    logout,
  };

  useEffect(() => {
    const token = JSON.parse(Cookies.get("token") ?? "{}");
    setUser(token);
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
