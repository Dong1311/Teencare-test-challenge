'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import RegisterStudentForm from '@/components/RegisterStudentForm';
import WeeklyClassesTable from '@/components/WeeklyClassesTable';
import FeedbackMessage from '@/components/FeedbackMessage';
import { api } from '@/lib/api';
import { ClassItem, FeedbackState, Student } from '@/lib/types';

const DAY_OPTIONS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [timeSlot, setTimeSlot] = useState('09:00-10:30');
  const [teacherName, setTeacherName] = useState('');
  const [maxStudents, setMaxStudents] = useState(20);
  const [creatingClass, setCreatingClass] = useState(false);
  const [classFeedback, setClassFeedback] = useState<FeedbackState | null>(null);

  const [registrationId, setRegistrationId] = useState<number | ''>('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<FeedbackState | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [classesData, studentsData] = await Promise.all([
        api.listClasses(),
        api.listStudents(),
      ]);
      setClasses(classesData);
      setStudents(studentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCreateClass(event: FormEvent) {
    event.preventDefault();
    setCreatingClass(true);
    setClassFeedback(null);

    try {
      await api.createClass({
        name,
        subject,
        dayOfWeek,
        timeSlot,
        teacherName,
        maxStudents,
      });

      setClassFeedback({ type: 'success', text: 'Class created successfully' });
      setName('');
      setSubject('');
      setDayOfWeek('MONDAY');
      setTimeSlot('09:00-10:30');
      setTeacherName('');
      setMaxStudents(20);
      await loadData();
    } catch (err) {
      setClassFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create class',
      });
    } finally {
      setCreatingClass(false);
    }
  }

  async function handleCancelRegistration(event: FormEvent) {
    event.preventDefault();
    if (!registrationId) {
      setCancelFeedback({ type: 'error', text: 'Please enter registration ID' });
      return;
    }

    setCancelLoading(true);
    setCancelFeedback(null);

    try {
      const result = await api.cancelRegistration(Number(registrationId));
      setCancelFeedback({
        type: 'success',
        text: `Registration removed. Refunded sessions: ${result.refundedSessions}`,
      });
      setRegistrationId('');
      await loadData();
    } catch (err) {
      setCancelFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to cancel registration',
      });
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <section className="stack">
      <div className="grid">
        <div className="card">
          <h3>Create Class</h3>
          <form className="form" onSubmit={handleCreateClass}>
            <label>
              Class Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label>
              Subject
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </label>

            <label>
              Day of Week
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              >
                {DAY_OPTIONS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Time Slot
              <input
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="09:00-10:30"
                required
              />
            </label>

            <label>
              Teacher Name
              <input
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
              />
            </label>

            <label>
              Max Students
              <input
                type="number"
                min={1}
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                required
              />
            </label>

            <button type="submit" disabled={creatingClass}>
              {creatingClass ? 'Creating...' : 'Create Class'}
            </button>
          </form>

          <FeedbackMessage feedback={classFeedback} />
        </div>

        <RegisterStudentForm
          students={students}
          classes={classes}
          onRegistered={() => void loadData()}
        />
      </div>

      <div className="card">
        <h3>Cancel Registration</h3>
        <form className="form" onSubmit={handleCancelRegistration}>
          <label>
            Registration ID
            <input
              type="number"
              min={1}
              value={registrationId}
              onChange={(e) =>
                setRegistrationId(e.target.value ? Number(e.target.value) : '')
              }
              required
            />
          </label>

          <button type="submit" disabled={cancelLoading}>
            {cancelLoading ? 'Cancelling...' : 'Cancel Registration'}
          </button>
        </form>

        <FeedbackMessage feedback={cancelFeedback} />
      </div>

      <div className="card">
        <h3>Weekly Classes View</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="feedback error">{error}</p>}
        {!loading && !error && <WeeklyClassesTable classes={classes} />}
      </div>
    </section>
  );
}
