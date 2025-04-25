import { getFetcher, postFetcher, putFetcher } from '../api';

export const getAllTransferData = (
  page: number,
  limit: number,
  filters?: string
) => {
  return getFetcher(
    `/transfer-data/get-all?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`,
    false
  );
};

export const getTransferData = (id: number) => {
  return getFetcher(`/transfer-data/get/${id}`, false);
};

export const getPendingTransferData = () => {
  return getFetcher('/transfer-data/get-pending', false);
};

export const getStudentTransferData = (studentId: number) => {
  return getFetcher(`/student-transfer-data/student/${studentId}`, false);
};

export const getAllStudentTransfers = () => {
  return getFetcher('/student-transfer/get-all', false);
};

export const getStudentsByTransferId = (transferId: number) => {
  return getFetcher(`/student-transfer/transfer/${transferId}`, false);
};

export const createTransferData = (data: any) => {
  return postFetcher('/transfer-data/create', data);
};

export const approveTransfer = (transferId: number) => {
  return putFetcher(`/transfer-data/approve/${transferId}`, {});
};

export const rejectTransfer = (transferId: number) => {
  return putFetcher(`/transfer-data/reject/${transferId}`, {});
};
