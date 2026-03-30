'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { ClassItem, Student } from '@/lib/types';
import FeedbackMessage from './FeedbackMessage';

interface RegisterStudentFormProps {
  students: Student[];
  classes: ClassItem[];
  onRegistered?: () => void;
}

export default function RegisterStudentForm({
  students,
  classes,
  onRegistered,
}: RegisterStudentFormProps) {
  const [studentId, setStudentId] = useState<number | ''>('');
  const [classId, setClassId] = useState<number | ''>('');
  const [classDate, setClassDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!studentId || !classId) {
      setFeedback({ type: 'error', text: 'Please choose both student and class' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const registration = await api.registerStudent(Number(classId), {
        studentId: Number(studentId),
        classDate,
      });

      setFeedback({
        type: 'success',
        text: `Registration #${registration.id} created successfully`,
      });

      onRegistered?.();
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Register Student to Class</h3>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Student
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Class
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Select class</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.dayOfWeek} ({item.timeSlot})
              </option>
            ))}
          </select>
        </label>

        <label>
          Class Date
          <input
            type="date"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <FeedbackMessage feedback={feedback} />
    </div>
  );
}
