'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Form, Input, Select } from 'antd';
import { api } from '@/lib/api';
import { Parent, Student } from '@/lib/types';
import FeedbackMessage from './FeedbackMessage';

interface StudentFormProps {
  parents: Parent[];
  onCreated?: (student: Student) => void;
}

interface StudentFormValues {
  name: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  currentGrade: string;
  parentId: number;
}

export default function StudentForm({ parents, onCreated }: StudentFormProps) {
  const [form] = Form.useForm<StudentFormValues>();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const parentOptions = useMemo(
    () =>
      parents.map((parent) => ({
        label: `${parent.name} (${parent.email})`,
        value: parent.id,
      })),
    [parents],
  );

  async function handleSubmit(values: StudentFormValues) {
    setLoading(true);
    setFeedback(null);

    try {
      const student = await api.createStudent(values);
      setFeedback({
        type: 'success',
        text: `Student ${student.name} created.`,
      });
      form.resetFields();
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
    <Card title="Create Student" bordered={false}>
      <Form
        layout="vertical"
        form={form}
        initialValues={{ gender: 'MALE' }}
        onFinish={handleSubmit}
      >
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Student name" />
        </Form.Item>

        <Form.Item label="Date of Birth" name="dob" rules={[{ required: true }]}>
          <Input type="date" />
        </Form.Item>

        <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
          <Select
            options={[
              { label: 'Male', value: 'MALE' },
              { label: 'Female', value: 'FEMALE' },
              { label: 'Other', value: 'OTHER' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Current Grade" name="currentGrade" rules={[{ required: true }]}>
          <Input placeholder="Grade 5" />
        </Form.Item>

        <Form.Item label="Parent" name="parentId" rules={[{ required: true }]}>
          <Select placeholder="Select parent" options={parentOptions} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Student
          </Button>
        </Form.Item>
      </Form>

      <FeedbackMessage feedback={feedback} />
    </Card>
  );
}
