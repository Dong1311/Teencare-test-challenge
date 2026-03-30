'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import RegisterStudentForm from '@/components/RegisterStudentForm';
import WeeklyClassesTable from '@/components/WeeklyClassesTable';
import FeedbackMessage from '@/components/FeedbackMessage';
import { api } from '@/lib/api';
import { ClassItem, FeedbackState, Student } from '@/lib/types';

const DAY_OPTIONS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

interface CreateClassValues {
  name: string;
  subject: string;
  dayOfWeek: string;
  timeSlot: string;
  teacherName: string;
  maxStudents: number;
}

interface CancelRegistrationValues {
  registrationId: number;
}

export default function ClassesPage() {
  const [createForm] = Form.useForm<CreateClassValues>();
  const [cancelForm] = Form.useForm<CancelRegistrationValues>();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creatingClass, setCreatingClass] = useState(false);
  const [classFeedback, setClassFeedback] = useState<FeedbackState | null>(null);

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<FeedbackState | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [classesData, studentsData] = await Promise.all([
        api.listClasses(),
        api.listStudents(),
      ]);
      setClasses(classesData);
      setStudents(studentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCreateClass(values: CreateClassValues) {
    setCreatingClass(true);
    setClassFeedback(null);

    try {
      await api.createClass(values);
      setClassFeedback({ type: 'success', text: 'Class created successfully' });
      createForm.resetFields();
      createForm.setFieldsValue({
        dayOfWeek: 'MONDAY',
        timeSlot: '09:00-10:30',
        maxStudents: 20,
      });
      await loadData();
    } catch (err) {
      setClassFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create class',
      });
    } finally {
      setCreatingClass(false);
    }
  }

  async function handleCancelRegistration(values: CancelRegistrationValues) {
    setCancelLoading(true);
    setCancelFeedback(null);

    try {
      const result = await api.cancelRegistration(values.registrationId);
      setCancelFeedback({
        type: 'success',
        text: `Registration removed. Refunded sessions: ${result.refundedSessions}`,
      });
      cancelForm.resetFields();
      await loadData();
    } catch (err) {
      setCancelFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to cancel registration',
      });
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Create Class" bordered={false}>
            <Form
              form={createForm}
              layout="vertical"
              onFinish={handleCreateClass}
              initialValues={{
                dayOfWeek: 'MONDAY',
                timeSlot: '09:00-10:30',
                maxStudents: 20,
              }}
            >
              <Form.Item label="Class Name" name="name" rules={[{ required: true }]}> 
                <Input placeholder="Math Monday" />
              </Form.Item>

              <Form.Item label="Subject" name="subject" rules={[{ required: true }]}> 
                <Input placeholder="Math" />
              </Form.Item>

              <Form.Item label="Day of Week" name="dayOfWeek" rules={[{ required: true }]}> 
                <Select
                  options={DAY_OPTIONS.map((day) => ({ label: day, value: day }))}
                />
              </Form.Item>

              <Form.Item label="Time Slot" name="timeSlot" rules={[{ required: true }]}> 
                <Input placeholder="09:00-10:30" />
              </Form.Item>

              <Form.Item label="Teacher Name" name="teacherName" rules={[{ required: true }]}> 
                <Input placeholder="Ms. Lan" />
              </Form.Item>

              <Form.Item label="Max Students" name="maxStudents" rules={[{ required: true }]}> 
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={creatingClass}>
                  Create Class
                </Button>
              </Form.Item>
            </Form>

            <FeedbackMessage feedback={classFeedback} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <RegisterStudentForm
            students={students}
            classes={classes}
            onRegistered={() => void loadData()}
          />
        </Col>
      </Row>

      <Card title="Cancel Registration" bordered={false}>
        <Form form={cancelForm} layout="vertical" onFinish={handleCancelRegistration}>
          <Form.Item
            label="Registration ID"
            name="registrationId"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button danger type="primary" htmlType="submit" loading={cancelLoading}>
              Cancel Registration
            </Button>
          </Form.Item>
        </Form>

        <FeedbackMessage feedback={cancelFeedback} />
      </Card>

      <Card
        bordered={false}
        title={<Typography.Title level={4} style={{ margin: 0 }}>Weekly Classes View</Typography.Title>}
      >
        {loading && <Spin />}
        {error && <Alert type="error" showIcon message={error} />}
        {!loading && !error && <WeeklyClassesTable classes={classes} />}
      </Card>
    </Space>
  );
}
