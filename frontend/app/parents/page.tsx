'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Card, Space, Spin, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ParentForm from '@/components/ParentForm';
import { api } from '@/lib/api';
import { Parent } from '@/lib/types';

const columns: ColumnsType<Parent> = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
];

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
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <ParentForm onCreated={() => void loadParents()} />

      <Card
        bordered={false}
        title={<Typography.Title level={4} style={{ margin: 0 }}>Parents List</Typography.Title>}
      >
        {loading && <Spin />}
        {error && <Alert type="error" showIcon message={error} />}

        {!loading && !error && (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={parents}
            pagination={false}
            locale={{ emptyText: 'No parents found' }}
          />
        )}
      </Card>
    </Space>
  );
}
