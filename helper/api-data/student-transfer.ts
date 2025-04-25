import { getFetcher, postFetcher, putFetcher } from '../api';

export const getStudentTransfersByTransferDataId = (transferDataId: number) => {
  return getFetcher(`/student-transfer/by-transfer/${transferDataId}`, false);
};
