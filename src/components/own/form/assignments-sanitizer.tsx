import React, { useMemo, useEffect } from 'react';

type Group = { professor_name: string; course_id: number; items: Array<{ id: number; name: string }> };

type SanitizerProps = {
  teacherGroups: Group[];
  assignments: string[];
  setFieldValue: (field: string, value: any) => void;
};

export const AssignmentsSanitizer: React.FC<SanitizerProps> = ({ teacherGroups, assignments, setFieldValue }) => {
  const teacherItemNames = useMemo(() => {
    const names: string[] = [];
    const list = Array.isArray(teacherGroups) ? teacherGroups : [];
    list.forEach((grp) => grp.items.forEach((it) => names.push(String(it.name || '').toLowerCase().trim())));
    return new Set(names);
  }, [teacherGroups]);

  useEffect(() => {
    const current = Array.isArray(assignments) ? assignments : [];
    const filtered = current.filter((n) => !teacherItemNames.has(String(n || '').toLowerCase().trim()));
    if (filtered.length !== current.length) {
      setFieldValue('assignments', filtered);
    }
  }, [teacherItemNames, assignments, setFieldValue]);

  useEffect(() => {
    const arr = Array.isArray(assignments) ? assignments : [];
    const seen = new Set<string>();
    const normalized = (s: any) => String(s || '').toLowerCase().trim();
    const next: string[] = [];
    for (const n of arr) {
      const key = normalized(n);
      if (key === '') {
        next.push(n as string);
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(n as string);
    }
    if (next.length !== arr.length) {
      setFieldValue('assignments', next);
    }
  }, [assignments, setFieldValue]);

  return null;
}
