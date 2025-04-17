import SvgIcon from 'CommonElements/Icons/SvgIcon';
import React, { useEffect, useState } from 'react';
import { Notifications } from 'utils/Constant';
import NotificationList from './NotificationList';
import useSWR from 'swr';
import { getPendingTransferData } from 'helper/api-data/transfer-data';
import { getAllStudentTransfers } from 'helper/api-data/transfer-data';

const Notificationbar = () => {
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch pending transfers to get the count
  const { data: transfersData } = useSWR(
    '/transfer-data/get-pending',
    getPendingTransferData,
    {
      refreshInterval: 10000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  // Fetch student transfers
  const { data: studentTransfersData } = useSWR(
    '/student-transfer/get-all',
    getAllStudentTransfers,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    if (transfersData?.data) {
      // Obtener las transferencias pendientes
      const transfers = Array.isArray(transfersData.data)
        ? transfersData.data
        : [];

      // Cada transferencia cuenta como una notificación
      setNotificationCount(transfers.length);
    }
  }, [transfersData]);

  return (
    <li className='onhover-dropdown'>
      <div className='notification-box'>
        <SvgIcon iconId='notification' />
        <span className='badge rounded-pill badge-secondary'>
          {notificationCount}
        </span>
      </div>
      <div className='onhover-show-div notification-dropdown'>
        <h6 className='f-18 mb-0 dropdown-title'>{Notifications}</h6>
        <NotificationList />
      </div>
    </li>
  );
};

export default Notificationbar;
