import React, { ReactElement, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, Button, Input } from 'reactstrap';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import NavigationBackButton from '@/components/own/navigation-back-button/navigation-back-button';
import useSWR, { mutate } from 'swr';
import CourseLayout from '@/components/own/course-layout/course-layout';
import TabsTeachers from '@/components/own/tabs-teachers/tabs-teachers';
import { getCourseById } from '../../../../helper/api-data/course';
import { 
  getPrivateClassesByCourse, 
  createMultiplePrivateClasses, 
  updatePrivateClass 
} from '../../../../helper/api-data/private-class-hours';
import { UserContext } from 'helper/User';
import { PRIVATE_COURSE_TYPES, USER_TYPES } from 'utils/constants';
import { toast } from 'react-toastify';
import { getFetcher, putFetcher } from '../../../../helper/api';
import { ReportEntry, NewEntry, EditData } from '../../../../Types/ReportTypes';

const tabsName = 'REPORT';
const STATUS_OPTIONS = ['PENDING', 'DONE', 'CANCELLED'] as const;
const DEFAULT_NEW_ENTRY: NewEntry = {
  date: new Date().toISOString().split('T')[0],
  status: 'PENDING',
  hours: 1,
  topic: ''
};

const getCourseReport = async (courseId: string, isPrivateClass: boolean) => {
  try {
    if (isPrivateClass) {
      return await getPrivateClassesByCourse(courseId);
    }
    return await getFetcher(`/attendance/get-by-course/${courseId}`, false);
  } catch (error) {
    throw new Error(`Failed to fetch course report: ${error}`);
  }
};

const updateReportEntry = async (entryId: number, data: any, isPrivateClass: boolean) => {
  try {
    if (isPrivateClass) {
      return await updatePrivateClass(entryId.toString(), data);
    }
    return await putFetcher(`/attendance/report-entry/${entryId}`, data);
  } catch (error) {
    throw new Error(`Failed to update entry: ${error}`);
  }
};

const TeachersReport: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const { user } = useContext(UserContext);
  
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData>({});
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newEntry, setNewEntry] = useState<NewEntry>(DEFAULT_NEW_ENTRY);

  const isProfessor = useMemo(() => user?.role === USER_TYPES.PROFESSOR, [user?.role]);
  
  const { data: courseDetail, error: courseError } = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000
    }
  );

  const courseData = courseDetail?.data;
  const isPrivateClass = useMemo(() => courseData?.course_type === PRIVATE_COURSE_TYPES.PRIVATE || courseData?.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE, [courseData?.course_type]);



  const { data: reportData, error: reportError, mutate: mutateReport } = useSWR(
    courseId && courseData ? `/report/${courseId}/${isPrivateClass}` : null,
    () => getCourseReport(courseId, isPrivateClass),
    {
      revalidateOnFocus: false,
      refreshInterval: 0
    }
  );

  const entries: ReportEntry[] = useMemo(() => {
    return (reportData?.data || []).map((item: any) => ({
      id: item.id,
      lesson_date: item.lesson_date,
      lesson_status: item.lesson_status,
      hours: parseFloat(item.hours) || 0,
      topic: item.topic
    }));
  }, [reportData?.data]);
  
  const usedHours = useMemo(() => {
    return entries.reduce((total, item) => total + (item.hours || 0), 0);
  }, [entries]);

  const remainingHours = useMemo(() => {
    const totalHours = courseData?.total_hours || 30;
    return Math.max(0, totalHours - usedHours);
  }, [usedHours, courseData?.total_hours]);


  useEffect(() => {
    if (isPrivateClass && isProfessor && entries.length === 0 && !isCreatingNew && !reportError) {
      setIsCreatingNew(true);
    }
  }, [isPrivateClass, isProfessor, entries.length, isCreatingNew, reportError]);

  const handleEdit = useCallback((entry: ReportEntry) => {
    setEditingEntry(entry.id);
    setEditData({
      lesson_status: entry.lesson_status,
      hours: entry.hours,
      topic: entry.topic
    });
  }, []);

  const handleSave = useCallback(async (entryId: number) => {
    if (!editData.lesson_status || !editData.hours || !editData.topic?.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    const currentEntry = entries.find(entry => entry.id === entryId);
    if (!currentEntry) {
      toast.error('Entry not found');
      return;
    }

    const totalHours = courseData?.total_hours || 30;
    const newTotalHours = usedHours - currentEntry.hours + editData.hours;
    if (newTotalHours > totalHours) {
      toast.error(`Cannot update entry. Total hours would exceed ${totalHours} hours limit.`);
      return;
    }

    try {
      await updateReportEntry(entryId, editData, isPrivateClass);
      await mutateReport();
      setEditingEntry(null);
      setEditData({});
      toast.success('Entry updated successfully');
    } catch (error) {
      toast.error('Failed to update entry');
    }
  }, [editData, isPrivateClass, mutateReport, entries, usedHours]);

  const handleCreateNew = useCallback(async () => {
    if (!newEntry.topic.trim()) {
      toast.error('Topic is required');
      return;
    }

    const totalHours = courseData?.total_hours || 30;
    const newTotalHours = usedHours + newEntry.hours;
    if (newTotalHours > totalHours) {
      toast.error(`Cannot add entry. Total hours would exceed ${totalHours} hours limit.`);
      return;
    }

    try {
      await createMultiplePrivateClasses(courseId, [newEntry]);
      await mutateReport();
      setIsCreatingNew(false);
      setNewEntry(DEFAULT_NEW_ENTRY);
      toast.success('New entry created successfully');
    } catch (error) {
      toast.error('Failed to create entry');
    }
  }, [courseId, newEntry, mutateReport, usedHours]);

  const handleCancel = useCallback(() => {
    setEditingEntry(null);
    setEditData({});
  }, []);

  const handleCancelNew = useCallback(() => {
    setIsCreatingNew(false);
    setNewEntry(DEFAULT_NEW_ENTRY);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).toUpperCase();
  }, []);

  if (courseError) {
    return (
      <Card tag='section' className='course-report'>
        <CardBody>
          <div className="alert alert-danger">
            Failed to load course data. Please try again.
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!courseData) {
    return (
      <Card tag='section' className='course-report'>
        <CardBody>
          <div className="d-flex justify-content-center p-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const { course_number } = courseData;

  return (
    <Card tag='section' className='course-report'>
      <CardBody>
        {!isProfessor && (
          <NavigationBackButton professorId={router.query.professorId} />
        )}
        
        <TabsTeachers
          numberOfClass={course_number}
          tabsName={tabsName}
        />
        
        {!isPrivateClass && (
          <div className="alert alert-info mb-3">
            <strong>Note:</strong> Detailed reports are only available for private classes.
          </div>
        )}

        {isPrivateClass && isProfessor && entries.length === 0 && !isCreatingNew && (
          <div className="alert alert-warning mb-3">
            <strong>Start your report!</strong> No entries yet. Click "Add New Entry" to begin.
          </div>
        )}
        
        <div className="report-content">
          <div className="report-table-container">
            {isPrivateClass && isProfessor && (
              <div className="add-entry-button-container">
                {!isCreatingNew && (
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setIsCreatingNew(true)}
                    disabled={usedHours >= (courseData?.total_hours || 30)}
                  >
                    + Add New Entry
                  </Button>
                )}
                {usedHours >= (courseData?.total_hours || 30) && (
                  <div className="text-muted small mt-1">
                    Maximum hours limit ({courseData?.total_hours || 30}) reached
                  </div>
                )}
              </div>
            )}

            <table className="report-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>HRS.</th>
                  <th>TOPIC</th>
                  {isPrivateClass && isProfessor && <th>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {isCreatingNew && (
                  <tr className="new-entry-row">
                    <td>
                      <Input
                        type="date"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry(prev => ({...prev, date: e.target.value}))}
                      />
                    </td>
                    <td>
                      <Input
                        type="select"
                        value={newEntry.status}
                        onChange={(e) => setNewEntry(prev => ({...prev, status: e.target.value}))}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Input>
                    </td>
                    <td>
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        max="8"
                        value={newEntry.hours}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setNewEntry(prev => ({...prev, hours: Math.max(1, value)}));
                        }}
                      />
                    </td>
                    <td>
                      <Input
                        type="text"
                        value={newEntry.topic}
                        onChange={(e) => setNewEntry(prev => ({...prev, topic: e.target.value}))}
                        placeholder="Lesson topic"
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          color="success"
                          onClick={handleCreateNew}
                          disabled={!newEntry.topic.trim()}
                        >
                          <i className="fa fa-save me-1"></i>
                          Create
                        </Button>
                        <Button
                          size="sm"
                          color="secondary"
                          onClick={handleCancelNew}
                        >
                          <i className="fa fa-times me-1"></i>
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}

                {entries.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.lesson_date)}</td>  
                    <td>
                      {editingEntry === item.id ? (
                        <Input
                          type="select"
                          value={editData.lesson_status || ''}
                          onChange={(e) => setEditData(prev => ({...prev, lesson_status: e.target.value}))}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </Input>
                      ) : (
                        item.lesson_status
                      )}
                    </td>
                    <td>
                      {editingEntry === item.id ? (
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="8"
                          value={editData.hours || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            setEditData(prev => ({...prev, hours: Math.max(1, value)}));
                          }}
                        />
                      ) : (
                        item.hours
                      )}
                    </td>
                    <td>
                      {editingEntry === item.id ? (
                        <Input
                          type="text"
                          value={editData.topic || ''}
                          onChange={(e) => setEditData(prev => ({...prev, topic: e.target.value}))}
                          placeholder="Lesson topic"
                        />
                      ) : (
                        item.topic || '-'
                      )}
                    </td>
                    {isPrivateClass && isProfessor && (
                      <td>
                        {editingEntry === item.id ? (
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              color="success"
                              onClick={() => handleSave(item.id)}
                              disabled={!editData.topic?.trim()}
                            >
                              <i className="fa fa-save me-1"></i>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              color="secondary"
                              onClick={handleCancel}
                            >
                              <i className="fa fa-times me-1"></i>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fa fa-edit me-1"></i>
                            Edit
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="badges-container">
            <div className="used-hours-badge">
              <div className="used-hours-header">USED HOURS</div>
              <div className="used-hours-value">{usedHours.toFixed(2)}</div>
            </div>
            
            <div className="remaining-hours-badge">
              <div className="remaining-hours-header">REMAINING HOURS</div>
              <div className="remaining-hours-value">{remainingHours.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

TeachersReport.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default TeachersReport;