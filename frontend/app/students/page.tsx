'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Card, Space, Spin, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import StudentForm from '@/components/StudentForm';
import { api } from '@/lib/api';
import { Parent, Student } from '@/lib/types';

const columns: ColumnsType<Student> = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 110 },
  { title: 'Grade', dataIndex: 'currentGrade', key: 'currentGrade', width: 130 },
  {
    title: 'Parent',
    key: 'parent',
    render: (_, student) => student.parent?.name || `Parent #${student.parentId}`,
  },
];

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
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <StudentForm parents={parents} onCreated={() => void loadData()} />

      <Card
        bordered={false}
        title={<Typography.Title level={4} style={{ margin: 0 }}>Students List</Typography.Title>}
      >
        {loading && <Spin />}
        {error && <Alert type="error" showIcon message={error} />}

        {!loading && !error && (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={students}
            pagination={false}
            locale={{ emptyText: 'No students found' }}
          />
        )}
      </Card>
    </Space>
  );
}
