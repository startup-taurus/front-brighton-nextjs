import { withoutLayoutThemePath } from "Data/OthersPageData";
import LayoutProvider from "helper/Layout/LayoutProvider";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import NoSsr from "utils/NoSsr";
import "../../i18n";
import "../../public/assets/scss/app.scss";
import Layout from "../layout";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import UserProvider from "helper/User/UserProvider";
import '../../public/assets/scss/themes/_custom.scss';


export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const Myapp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout || ((page: any) => <Layout>{page}</Layout>);
  const router = useRouter();
  const currentUrl = router.asPath;
  let updatedPath;
  if (currentUrl.includes("?")) {
    const tempt = currentUrl;
    updatedPath = tempt.split("?")[0];
  } else {
    updatedPath = currentUrl;
  }

  return (
    <NoSsr>
      <UserProvider>
        {withoutLayoutThemePath.includes(updatedPath) ? (
          <Component {...pageProps} />
        ) : (
          <LayoutProvider>
            {getLayout(<Component {...pageProps} />)}
          </LayoutProvider>
        )}
        <ToastContainer />
      </UserProvider>
    </NoSsr>
  );
};

export default Myapp;
