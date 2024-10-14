import { createContext } from "react";

interface UserContextProps {
  user: any;
  login: (user: any) => void;
  logout: () => void;
}

export const initialUserState = {
  id: 0,
};

export const UserContext = createContext<UserContextProps>({
  user: initialUserState,
  login: (user) => {},
  logout: () => {},
});
