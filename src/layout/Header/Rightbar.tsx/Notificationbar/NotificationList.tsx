import React, { useEffect, useState } from 'react';

import useSWR from 'swr';
import { useRouter } from 'next/router';
import { getPendingTransferData } from 'helper/api-data/transfer-data';

interface Student {
  id: number;
  cedula: string;
  phone_number: string | null;
  status: string;
  user: { id: number; name: string; email: string };
}

interface PendingItem {
  transfer_data: {
    id: number;
    status_level_change: string;
    description: string;
    is_group: boolean;
    created_by: { id: number; name: string; email: string };
    selected_course: { id: number; course_name: string } | null;
    selected_level: { id: number; full_level: string } | null;
    created_at: string;
    updated_at: string;
  };
  students: Array<{
    student_id: number;
    transfer_data_id: number;
    student: Student;
  }>;
}

interface CombinedTransfer {
  id: number;
  transfer_data: PendingItem['transfer_data'];
  students: Student[];
  student_count: number;
}

const NotificationList: React.FC = () => {
  const [allNotifications, setAllNotifications] = useState<CombinedTransfer[]>(
    []
  );
  const router = useRouter();

  const { data: pendingResponse } = useSWR<{
    data: PendingItem[];
  }>('/transfer-data/get-pending', getPendingTransferData, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (!pendingResponse?.data) return;
    const combined: CombinedTransfer[] = pendingResponse.data.map((item) => ({
      id: item.transfer_data.id,
      transfer_data: item.transfer_data,
      students: item.students.map((s) => s.student),
      student_count: item.students.length,
    }));
    setAllNotifications(combined);
  }, [pendingResponse]);

  const handleTransferClick = (transfer: CombinedTransfer) => {
    const tid = transfer.transfer_data.id;
    router.replace(`/admin/transfer-students?id=${tid}`);
  };

  useEffect(() => {
    const badge = document.querySelector('.notification-box .badge');
    if (badge) badge.textContent = allNotifications.length.toString();
  }, [allNotifications]);

  return (
    <ul className='simple-list'>
      <div
        className='overflow-auto'
        style={{ maxHeight: '300px' }}
      >
        {allNotifications.map((t, idx) => {
          const td = t.transfer_data;
          const first = t.students[0];
          return (
            <li
              key={`noti-${idx}-${td.id}`}
              className={
                td.is_group ? 'b-l-primary border-4' : 'b-l-success border-4'
              }
              onClick={() => handleTransferClick(t)}
            >
              <div className='notification-item'>
                <div className='notification-header d-flex justify-content-between'>
                  <strong>
                    {td.is_group
                      ? `Group transfer (${t.student_count} students)`
                      : first?.user.name}
                  </strong>
                </div>
                <div className='small text-muted'>
                  {td.is_group ? (
                    <span>
                      Course: {td.selected_course?.course_name || '—'} – Level:{' '}
                      {td.selected_level?.full_level || '—'}
                    </span>
                  ) : (
                    <span>ID: {first?.cedula || 'N/A'}</span>
                  )}
                </div>
                <small className='text-muted d-block mt-1'>
                  Date: {new Date(td.created_at).toLocaleDateString()}
                </small>
              </div>
            </li>
          );
        })}

        {allNotifications.length === 0 && (
          <li className='b-l-secondary border-4'>
            <p>No pending transfers</p>
          </li>
        )}
      </div>

      <li>
        <a
          className='f-w-700'
          href='#'
          onClick={(e) => {
            e.preventDefault();
            router.replace(
              '/admin/transfer-students?status_level_change=pending'
            );
          }}
        ></a>
      </li>
    </ul>
  );
};

export default NotificationList;
