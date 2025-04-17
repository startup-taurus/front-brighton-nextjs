import React, { useEffect, useState } from 'react';
import { Checkall } from 'utils/Constant';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { getPendingTransferData } from 'helper/api-data/transfer-data';
import { getFetcher } from 'helper/api';

interface Student {
  id: number;
  cedula: string;
  phone_number: string | null;
  status: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface TransferData {
  id: number;
  selected_course_id: number;
  selected_level_id: number;
  status_level_change: string;
  description: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  created_by_id: number;
  selected_course: {
    id: number;
    course_name: string;
  };
  selected_level: {
    id: number;
    full_level: string;
  };
  created_by: {
    id: number;
    name: string;
    email: string;
  };
}

interface StudentTransfer {
  student_id: number;
  transfer_data_id: number;
  student: Student;
  transfer_data: {
    id: number;
    selected_course_id: number;
    selected_level_id: number;
    status_level_change: string;
    description: string;
    is_group: boolean;
  };
}

interface CombinedTransfer {
  id: number;
  transfer_data_id: number;
  selected_course_id: number;
  selected_level_id: number;
  status_level_change: string;
  description: string;
  is_group: boolean;
  created_at: string;
  updated_at?: string;
  created_by_id?: number;
  selected_course: {
    id: number;
    course_name: string;
  };
  selected_level: {
    id: number;
    full_level: string;
  };
  created_by?: {
    id: number;
    name: string;
    email: string;
  };
  students?: Student[];
  student_count?: number;
}

const NotificationList = () => {
  const [allNotifications, setAllNotifications] = useState<CombinedTransfer[]>(
    []
  );
  const router = useRouter();

  const { data: transfersData } = useSWR(
    '/transfer-data/get-pending',
    getPendingTransferData,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  const { data: studentTransfersData } = useSWR(
    '/student-transfer/get-all',
    () => getFetcher('/student-transfer/get-all', false),
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    if (transfersData?.data && studentTransfersData?.data) {
      const transfers = transfersData.data as TransferData[];
      const studentTransfers = studentTransfersData.data as StudentTransfer[];

      // Crear un mapa de transferencias por ID
      const transferMap = new Map<number, CombinedTransfer>();

      // Procesar las transferencias principales
      transfers.forEach((transfer) => {
        transferMap.set(transfer.id, {
          id: transfer.id,
          transfer_data_id: transfer.id,
          selected_course_id: transfer.selected_course_id,
          selected_level_id: transfer.selected_level_id,
          status_level_change: transfer.status_level_change,
          description: transfer.description,
          is_group: transfer.is_group,
          created_at: transfer.created_at,
          updated_at: transfer.updated_at,
          created_by_id: transfer.created_by_id,
          selected_course: transfer.selected_course,
          selected_level: transfer.selected_level,
          created_by: transfer.created_by,
          students: [],
          student_count: 0,
        });
      });

      // Agregar estudiantes a sus transferencias correspondientes
      studentTransfers.forEach((studentTransfer) => {
        const transferId = studentTransfer.transfer_data_id;
        const transfer = transferMap.get(transferId);

        if (transfer) {
          if (!transfer.students) {
            transfer.students = [];
          }
          transfer.students.push(studentTransfer.student);
          transfer.student_count = (transfer.student_count || 0) + 1;
        }
      });

      // Convertir el mapa a un array
      const combined = Array.from(transferMap.values());
      setAllNotifications(combined);
    }
  }, [transfersData, studentTransfersData]);

  const handleTransferClick = (transfer: CombinedTransfer) => {
    // Para transferencias grupales, redirigir a la página de transferencias con el ID específico
    if (transfer.is_group) {
      router.replace(`/admin/transfer-students?transfer_id=${transfer.id}`);
      return;
    }

    // Para transferencias individuales, si hay un estudiante
    if (transfer.students && transfer.students.length > 0) {
      const student = transfer.students[0];
      const name = student.user?.name || '';
      const encodedName = encodeURIComponent(name);

      // Incluir información del estudiante en la URL para mejorar el filtrado
      const studentId = student.cedula || '';
      const studentIdParam = studentId
        ? `&cedula=${encodeURIComponent(studentId)}`
        : '';
      const courseIdParam = transfer.selected_course_id
        ? `&course=${transfer.selected_course_id}`
        : '';

      // Construir la URL con todos los parámetros relevantes
      const url = `/admin/students?status_level_change=pending&name=${encodedName}${studentIdParam}${courseIdParam}&transfer_id=${transfer.id}`;

      // Usar replace en lugar de push para asegurar que se actualice completamente la página
      router.replace(url);
    } else {
      // Si no hay información de estudiante, redirigir a la página de transferencias
      router.replace(`/admin/transfer-students?transfer_id=${transfer.id}`);
    }
  };

  const totalNotifications = allNotifications.length;

  useEffect(() => {
    const notificationBadge = document.querySelector(
      '.notification-box .badge'
    );
    if (notificationBadge) {
      notificationBadge.textContent = totalNotifications.toString();
    }
  }, [totalNotifications]);

  return (
    <ul className='simple-list'>
      {/* Contenedor con scroll para TODAS las notificaciones */}
      <div
        className='overflow-auto'
        style={{ maxHeight: '300px' }}
      >
        {allNotifications.map((transfer, index) => (
          <li
            key={`noti-${index}-${transfer.id}`}
            className={
              transfer.is_group
                ? 'b-l-primary border-4'
                : 'b-l-success border-4'
            }
            onClick={() => handleTransferClick(transfer)}
          >
            <div className='notification-item'>
              <div className='notification-header d-flex justify-content-between'>
                <strong>
                  {transfer.is_group
                    ? `Group transfer (${transfer.student_count || 0} students)`
                    : transfer.students && transfer.students[0]?.user?.name}
                </strong>
              </div>
              <div className='small text-muted'>
                {transfer.is_group ? (
                  <span>
                    Course: {transfer.selected_course?.course_name} - Level:{' '}
                    {transfer.selected_level?.full_level}
                  </span>
                ) : transfer.students && transfer.students[0] ? (
                  <span>ID: {transfer.students[0].cedula || 'N/A'}</span>
                ) : null}
              </div>
              <small className='text-muted d-block mt-1'>
                Date: {new Date(transfer.created_at).toLocaleDateString()}
              </small>
            </div>
          </li>
        ))}

        {allNotifications.length === 0 && (
          <li className='b-l-secondary border-4'>
            <p>No pending transfers</p>
          </li>
        )}
      </div>

      {/* Botón para ver todos */}
      <li>
        <a
          className='f-w-700'
          href='#'
          onClick={() =>
            router.replace(
              '/admin/transfer-students?status_level_change=pending'
            )
          }
        >
          {Checkall}
        </a>
      </li>
    </ul>
  );
};

export default NotificationList;
