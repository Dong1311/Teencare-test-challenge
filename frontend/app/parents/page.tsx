'use client';

import { useCallback, useEffect, useState } from 'react';
import ParentForm from '@/components/ParentForm';
import { api } from '@/lib/api';
import { Parent } from '@/lib/types';

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParents = useCallback(async () => {
    try {
      setError(null);
      const data = await api.listParents();
      setParents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadParents();
  }, [loadParents]);

  return (
    <section className="stack">
      <ParentForm onCreated={() => void loadParents()} />

      <div className="card">
        <h3>Parents List</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="feedback error">{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((parent) => (
                <tr key={parent.id}>
                  <td>{parent.id}</td>
                  <td>{parent.name}</td>
                  <td>{parent.phone}</td>
                  <td>{parent.email}</td>
                </tr>
              ))}
              {parents.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    No parents found
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
