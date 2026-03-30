'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Student, Subscription } from '@/lib/types';
import FeedbackMessage from './FeedbackMessage';

interface SubscriptionFormProps {
  students: Student[];
  onCreated?: (subscription: Subscription) => void;
}

export default function SubscriptionForm({
  students,
  onCreated,
}: SubscriptionFormProps) {
  const [studentId, setStudentId] = useState<number | ''>('');
  const [packageName, setPackageName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSessions, setTotalSessions] = useState(12);
  const [usedSessions, setUsedSessions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!studentId) {
      setFeedback({ type: 'error', text: 'Please choose a student' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const subscription = await api.createSubscription({
        studentId: Number(studentId),
        packageName,
        startDate,
        endDate,
        totalSessions,
        usedSessions,
      });

      setFeedback({
        type: 'success',
        text: `Subscription #${subscription.id} created.`,
      });

      setStudentId('');
      setPackageName('');
      setStartDate('');
      setEndDate('');
      setTotalSessions(12);
      setUsedSessions(0);
      onCreated?.(subscription);
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to create subscription',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Create Subscription</h3>
      <form onSubmit={handleSubmit} className="form">
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
          Package Name
          <input
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="12-session package"
            required
          />
        </label>

        <label>
          Start Date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </label>

        <label>
          Total Sessions
          <input
            type="number"
            min={1}
            value={totalSessions}
            onChange={(e) => setTotalSessions(Number(e.target.value))}
            required
          />
        </label>

        <label>
          Used Sessions
          <input
            type="number"
            min={0}
            value={usedSessions}
            onChange={(e) => setUsedSessions(Number(e.target.value))}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Subscription'}
        </button>
      </form>

      <FeedbackMessage feedback={feedback} />
    </div>
  );
}
