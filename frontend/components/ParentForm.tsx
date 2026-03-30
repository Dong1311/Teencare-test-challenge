'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Parent } from '@/lib/types';
import FeedbackMessage from './FeedbackMessage';

interface ParentFormProps {
  onCreated?: (parent: Parent) => void;
}

export default function ParentForm({ onCreated }: ParentFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const parent = await api.createParent({ name, phone, email });
      setFeedback({ type: 'success', text: `Parent ${parent.name} created.` });
      setName('');
      setPhone('');
      setEmail('');
      onCreated?.(parent);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create parent',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Create Parent</h3>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Parent'}
        </button>
      </form>

      <FeedbackMessage feedback={feedback} />
    </div>
  );
}
