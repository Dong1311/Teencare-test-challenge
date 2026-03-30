'use client';

import { useCallback, useEffect, useState } from 'react';
import StudentForm from '@/components/StudentForm';
import { api } from '@/lib/api';
import { Parent, Student } from '@/lib/types';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [studentsData, parentsData] = await Promise.all([
        api.listStudents(),
        api.listParents(),
      ]);
      setStudents(studentsData);
      setParents(parentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <section className="stack">
      <StudentForm parents={parents} onCreated={() => void loadData()} />

      <div className="card">
        <h3>Students List</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="feedback error">{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Grade</th>
                <th>Parent</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.gender}</td>
                  <td>{student.currentGrade}</td>
                  <td>{student.parent?.name || student.parentId}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
