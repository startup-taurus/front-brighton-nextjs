import React, { useEffect, useState } from 'react';
import SvgIcon from 'CommonElements/Icons/SvgIcon';
import { Notifications } from 'utils/Constant';
import NotificationList from './NotificationList';
import useSWR from 'swr';
import { getPendingTransferData } from 'helper/api-data/transfer-data';

const Notificationbar: React.FC = () => {
  const [notificationCount, setNotificationCount] = useState(0);

  const { data: pendingResponse } = useSWR<{
    data: any[];
  }>('/transfer-data/get-pending', getPendingTransferData, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    const count = Array.isArray(pendingResponse?.data)
      ? pendingResponse.data.length
      : 0;
    setNotificationCount(count);
  }, [pendingResponse]);

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
