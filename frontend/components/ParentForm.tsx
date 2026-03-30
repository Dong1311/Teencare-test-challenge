'use client';

import { useState } from 'react';
import { Button, Card, Form, Input } from 'antd';
import { api } from '@/lib/api';
import { Parent } from '@/lib/types';
import FeedbackMessage from './FeedbackMessage';

interface ParentFormProps {
  onCreated?: (parent: Parent) => void;
}

interface ParentFormValues {
  name: string;
  phone: string;
  email: string;
}

export default function ParentForm({ onCreated }: ParentFormProps) {
  const [form] = Form.useForm<ParentFormValues>();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function handleSubmit(values: ParentFormValues) {
    setLoading(true);
    setFeedback(null);

    try {
      const parent = await api.createParent(values);
      setFeedback({ type: 'success', text: `Parent ${parent.name} created.` });
      form.resetFields();
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
    <Card title="Create Parent" bordered={false}>
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Parent name" />
        </Form.Item>

        <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
          <Input placeholder="0901234567" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true }, { type: 'email', message: 'Invalid email' }]}
        >
          <Input placeholder="parent@example.com" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Parent
          </Button>
        </Form.Item>
      </Form>

      <FeedbackMessage feedback={feedback} />
    </Card>
  );
}
