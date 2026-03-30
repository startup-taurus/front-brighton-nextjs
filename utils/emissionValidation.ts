export type MissingGradeItem = {
  itemId: number;
  itemName: string;
  category?: string;
};

const toNumber = (value: any): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const isGradeValuePresent = (grade: any): boolean => {
  if (grade === null || grade === undefined) return false;
  if (typeof grade === 'string' && grade.trim() === '') return false;
  return toNumber(grade) !== null;
};

export const getMissingGradeItems = (
  gradingItems: any[] = [],
  gradesByStudent: any[] = []
): MissingGradeItem[] => {
  const gradeByItemId = new Map<number, any>();

  gradesByStudent.forEach((gradeRow: any) => {
    const itemId = toNumber(gradeRow?.grading_item_id);
    if (itemId !== null) {
      gradeByItemId.set(itemId, gradeRow?.grade);
    }
  });

  return gradingItems
    .map((item: any) => ({
      itemId: toNumber(item?.item_id) || 0,
      itemName: item?.item_name || `Item ${item?.item_id}`,
      category: item?.category,
    }))
    .filter((item) => item.itemId > 0)
    .filter((item) => !isGradeValuePresent(gradeByItemId.get(item.itemId)));
};

export const getMissingGradeItemsByStudent = (
  gradingItems: any[] = [],
  gradesByCourse: any[] = [],
  studentId: string | number
): MissingGradeItem[] => {
  const normalizedStudentId = String(studentId);
  const gradesByStudent = gradesByCourse.filter(
    (row: any) => String(row?.student_id) === normalizedStudentId
  );

  return getMissingGradeItems(gradingItems, gradesByStudent);
};

export const formatMissingItemsHtml = (
  missingItems: MissingGradeItem[] = []
): string => {
  if (!missingItems.length) return '';

  const grouped = missingItems.reduce(
    (acc: Record<string, string[]>, item) => {
      const section = item.category || 'OTHERS';
      acc[section] = [...(acc[section] || []), item.itemName];
      return acc;
    },
    {}
  );

  return Object.entries(grouped)
    .map(([section, names]) => {
      const items = names.map((name) => `<li>${name}</li>`).join('');
      return `<div style="text-align:left;margin-bottom:8px;"><strong>${section}</strong><ul style="margin:4px 0 0 18px;">${items}</ul></div>`;
    })
    .join('');
};
