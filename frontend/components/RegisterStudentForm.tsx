'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Form, Input, Select } from 'antd';
import { api } from '@/lib/api';
import { ClassItem, Student } from '@/lib/types';
import FeedbackMessage from './FeedbackMessage';

interface RegisterStudentFormProps {
  students: Student[];
  classes: ClassItem[];
  onRegistered?: () => void;
}

interface RegisterFormValues {
  studentId: number;
  classId: number;
  classDate: string;
}

export default function RegisterStudentForm({
  students,
  classes,
  onRegistered,
}: RegisterStudentFormProps) {
  const [form] = Form.useForm<RegisterFormValues>();
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

  const classOptions = useMemo(
    () =>
      classes.map((item) => ({
        label: `${item.name} - ${item.dayOfWeek} (${item.timeSlot})`,
        value: item.id,
      })),
    [classes],
  );

  async function handleSubmit(values: RegisterFormValues) {
    setLoading(true);
    setFeedback(null);

    try {
      const registration = await api.registerStudent(values.classId, {
        studentId: values.studentId,
        classDate: values.classDate,
      });

      setFeedback({
        type: 'success',
        text: `Registration #${registration.id} created successfully`,
      });

      form.resetFields();
      onRegistered?.();
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Register Student to Class" bordered={false}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Student" name="studentId" rules={[{ required: true }]}> 
          <Select placeholder="Select student" options={studentOptions} />
        </Form.Item>

        <Form.Item label="Class" name="classId" rules={[{ required: true }]}> 
          <Select placeholder="Select class" options={classOptions} />
        </Form.Item>

        <Form.Item label="Class Date" name="classDate" rules={[{ required: true }]}> 
          <Input type="date" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>

      <FeedbackMessage feedback={feedback} />
    </Card>
  );
}
