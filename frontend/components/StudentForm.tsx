'use client';

import { FormEvent, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Parent, Student } from '@/lib/types';
import FeedbackMessage from './FeedbackMessage';

interface StudentFormProps {
  parents: Parent[];
  onCreated?: (student: Student) => void;
}

export default function StudentForm({ parents, onCreated }: StudentFormProps) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');
  const [currentGrade, setCurrentGrade] = useState('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isDisabled = useMemo(
    () => loading || !parentId,
    [loading, parentId],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!parentId) {
      setFeedback({ type: 'error', text: 'Please choose a parent' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const student = await api.createStudent({
        name,
        dob,
        gender,
        currentGrade,
        parentId: Number(parentId),
      });

      setFeedback({
        type: 'success',
        text: `Student ${student.name} created.`,
      });
      setName('');
      setDob('');
      setGender('MALE');
      setCurrentGrade('');
      setParentId('');
      onCreated?.(student);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create student',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Create Student</h3>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Date of Birth
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
        </label>

        <label>
          Gender
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label>
          Current Grade
          <input
            value={currentGrade}
            onChange={(e) => setCurrentGrade(e.target.value)}
            placeholder="Grade 5"
            required
          />
        </label>

        <label>
          Parent
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Select parent</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name} ({parent.email})
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isDisabled}>
          {loading ? 'Creating...' : 'Create Student'}
        </button>
      </form>

      <FeedbackMessage feedback={feedback} />
    </div>
  );
}
