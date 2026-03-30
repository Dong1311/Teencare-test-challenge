'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Select } from 'antd';
import { api } from '@/lib/api';
import { Student, Subscription } from '@/lib/types';
import FeedbackMessage from './FeedbackMessage';

interface SubscriptionFormProps {
  students: Student[];
  onCreated?: (subscription: Subscription) => void;
}

interface SubscriptionFormValues {
  studentId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  usedSessions: number;
}

export default function SubscriptionForm({
  students,
  onCreated,
}: SubscriptionFormProps) {
  const [form] = Form.useForm<SubscriptionFormValues>();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        label: student.name,
        value: student.id,
      })),
    [students],
  );

  async function handleSubmit(values: SubscriptionFormValues) {
    setLoading(true);
    setFeedback(null);

    try {
      const subscription = await api.createSubscription(values);

      setFeedback({
        type: 'success',
        text: `Subscription #${subscription.id} created.`,
      });

      form.resetFields();
      form.setFieldValue('totalSessions', 12);
      form.setFieldValue('usedSessions', 0);
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
    <Card title="Create Subscription" bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ totalSessions: 12, usedSessions: 0 }}
      >
        <Form.Item label="Student" name="studentId" rules={[{ required: true }]}> 
          <Select placeholder="Select student" options={studentOptions} />
        </Form.Item>

        <Form.Item label="Package Name" name="packageName" rules={[{ required: true }]}> 
          <Input placeholder="12-session package" />
        </Form.Item>

        <Form.Item label="Start Date" name="startDate" rules={[{ required: true }]}> 
          <Input type="date" />
        </Form.Item>

        <Form.Item label="End Date" name="endDate" rules={[{ required: true }]}> 
          <Input type="date" />
        </Form.Item>

        <Form.Item label="Total Sessions" name="totalSessions" rules={[{ required: true }]}> 
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Used Sessions" name="usedSessions" rules={[{ required: true }]}> 
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Subscription
          </Button>
        </Form.Item>
      </Form>

      <FeedbackMessage feedback={feedback} />
    </Card>
  );
}
