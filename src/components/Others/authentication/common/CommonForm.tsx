import Link from "next/link";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { Button, FormGroup, Input, Label } from "reactstrap";
import {
  EmailAddress,
  EnterEmailPasswordLogin,
  ForgotPassword,
  Password,
  RememberPassword,
  SignIn,
  SignInAccount,
} from "utils/Constant";

import Cookies from "js-cookie";
import { toast } from "react-toastify";
import CommonLogo from "./CommonLogo";
import { useRouter } from "next/router";
import { postLogin } from "helper/api-data/user";
import { UserContext } from "helper/User";
export interface commonFormPropsType {
  alignLogo?: string;
}
const CommonForm = ({ alignLogo }: commonFormPropsType) => {
  const { login } = useContext(UserContext);

  const [showPassWord, setShowPassWord] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "jean",
    password: "123",
  });
  const { username, password } = formValues;
  const router = useRouter();
  const handleUserValue = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };
  const formSubmitHandle = async (event: FormEvent) => {
    event.preventDefault();
    const response = await postLogin({ username, password });

    if (response?.status === "success") {
      Cookies.set("token", JSON.stringify(response?.data));
      login(response.data);

      if (response.data.role === "admin_staff") {
        router.push("/dashboard");
      } else {
        router.push("/teachers");
      }

      toast.success("Login Success");
    }
  };
  return (
    <div className="login-card login-dark">
      <div>
        <div>
          <CommonLogo alignLogo={alignLogo} />
        </div>
        <div className="login-main">
          <form className="theme-form" onSubmit={formSubmitHandle}>
            <h4>{SignInAccount}</h4>
            <p>{EnterEmailPasswordLogin}</p>
            <FormGroup>
              <Label className="col-form-label">{EmailAddress}</Label>
              <Input
                type="text"
                required
                placeholder="Test"
                value={username}
                name="username"
                onChange={handleUserValue}
              />
            </FormGroup>
            <FormGroup>
              <Label className="col-form-label">{Password}</Label>
              <div className="form-input position-relative">
                <Input
                  type={showPassWord ? "text" : "password"}
                  placeholder="*********"
                  onChange={handleUserValue}
                  value={password}
                  name="password"
                />
                <div className="show-hide">
                  <span
                    onClick={() => setShowPassWord(!showPassWord)}
                    className={!showPassWord ? "show" : ""}
                  />
                </div>
              </div>
            </FormGroup>
            <FormGroup className="mb-0 position-relative">
              <div className="checkbox p-0">
                <Input id="checkbox1" type="checkbox" />
                <Label className="text-muted" htmlFor="checkbox1">
                  {RememberPassword}
                </Label>
              </div>
              <Link className="link" href="/pages/authentication/forget-pwd">
                {ForgotPassword}
              </Link>
              <div className="text-end mt-3">
                <Button
                  color="primary"
                  className="btn-block w-100"
                  type="submit"
                >
                  {SignIn}
                </Button>
              </div>
            </FormGroup>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommonForm;
