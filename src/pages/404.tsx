import CommonErrorPage from "@/components/Others/Error/common/CommonErrorPage";

const NotFound = () => {
  return (
    <div className="page-body pt-2">
      <CommonErrorPage
        tittle={404}
        tittleClassName="font-danger"
        BtnClassName="btn-danger-gradien"
      />
    </div>
  );
};

export default NotFound;
