'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import FeedbackMessage from '@/components/FeedbackMessage';
import SubscriptionForm from '@/components/SubscriptionForm';
import { api } from '@/lib/api';
import { FeedbackState, Student, Subscription } from '@/lib/types';

export default function SubscriptionsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const [subscriptionId, setSubscriptionId] = useState<number | ''>('');
  const [subscriptionDetail, setSubscriptionDetail] = useState<Subscription | null>(null);
  const [lookupFeedback, setLookupFeedback] = useState<FeedbackState | null>(null);

  const [useSubscriptionId, setUseSubscriptionId] = useState<number | ''>('');
  const [useSessions, setUseSessions] = useState(1);
  const [useFeedback, setUseFeedback] = useState<FeedbackState | null>(null);

  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setError(null);
      const data = await api.listStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  async function handleStudentSelect(studentId: number | '') {
    setSelectedStudentId(studentId);
    setSelectedStudent(null);

    if (!studentId) {
      return;
    }

    setLoadingStudent(true);
    try {
      const student = await api.getStudent(studentId);
      setSelectedStudent(student);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch student subscriptions',
      );
    } finally {
      setLoadingStudent(false);
    }
  }

  async function handleLookupSubscription(event: FormEvent) {
    event.preventDefault();
    if (!subscriptionId) {
      setLookupFeedback({ type: 'error', text: 'Please enter subscription ID' });
      return;
    }

    try {
      const subscription = await api.getSubscription(Number(subscriptionId));
      setSubscriptionDetail(subscription);
      setLookupFeedback({ type: 'success', text: 'Subscription found' });
    } catch (err) {
      setSubscriptionDetail(null);
      setLookupFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fetch subscription',
      });
    }
  }

  async function handleUseSubscription(event: FormEvent) {
    event.preventDefault();
    if (!useSubscriptionId) {
      setUseFeedback({ type: 'error', text: 'Please enter subscription ID' });
      return;
    }

    try {
      const updated = await api.useSubscription(Number(useSubscriptionId), {
        sessions: useSessions,
      });
      setUseFeedback({
        type: 'success',
        text: `Updated subscription #${updated.id}. Used: ${updated.usedSessions}/${updated.totalSessions}`,
      });

      if (subscriptionDetail?.id === updated.id) {
        setSubscriptionDetail(updated);
      }

      if (selectedStudentId) {
        await handleStudentSelect(Number(selectedStudentId));
      }
    } catch (err) {
      setUseFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to use subscription',
      });
    }
  }

  return (
    <section className="stack">
      <SubscriptionForm
        students={students}
        onCreated={() => {
          if (selectedStudentId) {
            void handleStudentSelect(Number(selectedStudentId));
          }
        }}
      />

      <div className="card">
        <h3>View Student Subscriptions</h3>

        {error && <p className="feedback error">{error}</p>}

        <label>
          Student
          <select
            value={selectedStudentId}
            onChange={(e) =>
              void handleStudentSelect(
                e.target.value ? Number(e.target.value) : '',
              )
            }
          >
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>

        {loadingStudent && <p>Loading student details...</p>}

        {!loadingStudent && selectedStudent && (
          <div style={{ marginTop: 12 }}>
            <p>
              <strong>{selectedStudent.name}</strong> ({selectedStudent.currentGrade})
            </p>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Package</th>
                  <th>Date Range</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                {(selectedStudent.subscriptions || []).map((subscription) => (
                  <tr key={subscription.id}>
                    <td>{subscription.id}</td>
                    <td>{subscription.packageName}</td>
                    <td>
                      {new Date(subscription.startDate).toLocaleDateString()} -{' '}
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </td>
                    <td>
                      {subscription.usedSessions}/{subscription.totalSessions}
                    </td>
                  </tr>
                ))}
                {(selectedStudent.subscriptions || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">
                      No subscriptions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>Get Subscription by ID</h3>
          <form className="form" onSubmit={handleLookupSubscription}>
            <label>
              Subscription ID
              <input
                type="number"
                min={1}
                value={subscriptionId}
                onChange={(e) =>
                  setSubscriptionId(e.target.value ? Number(e.target.value) : '')
                }
              />
            </label>

            <button type="submit">Lookup Subscription</button>
          </form>

          <FeedbackMessage feedback={lookupFeedback} />

          {subscriptionDetail && (
            <div style={{ marginTop: 12 }}>
              <p>ID: {subscriptionDetail.id}</p>
              <p>Package: {subscriptionDetail.packageName}</p>
              <p>
                Usage: {subscriptionDetail.usedSessions}/
                {subscriptionDetail.totalSessions}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Use Subscription Sessions</h3>
          <form className="form" onSubmit={handleUseSubscription}>
            <label>
              Subscription ID
              <input
                type="number"
                min={1}
                value={useSubscriptionId}
                onChange={(e) =>
                  setUseSubscriptionId(e.target.value ? Number(e.target.value) : '')
                }
              />
            </label>

            <label>
              Sessions to use
              <input
                type="number"
                min={1}
                value={useSessions}
                onChange={(e) => setUseSessions(Number(e.target.value))}
              />
            </label>

            <button type="submit">Use Sessions</button>
          </form>

          <FeedbackMessage feedback={useFeedback} />
        </div>
      </div>
    </section>
  );
}
