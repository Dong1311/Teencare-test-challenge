'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import FeedbackMessage from '@/components/FeedbackMessage';
import SubscriptionForm from '@/components/SubscriptionForm';
import { api } from '@/lib/api';
import { FeedbackState, Student, Subscription } from '@/lib/types';

interface LookupValues {
  subscriptionId: number;
}

interface UseSubscriptionValues {
  subscriptionId: number;
  sessions: number;
}

const subscriptionColumns: ColumnsType<Subscription> = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Package', dataIndex: 'packageName', key: 'packageName' },
  {
    title: 'Date Range',
    key: 'dateRange',
    render: (_, subscription) =>
      `${new Date(subscription.startDate).toLocaleDateString()} - ${new Date(subscription.endDate).toLocaleDateString()}`,
  },
  {
    title: 'Usage',
    key: 'usage',
    render: (_, subscription) => `${subscription.usedSessions}/${subscription.totalSessions}`,
  },
];

export default function SubscriptionsPage() {
  const [lookupForm] = Form.useForm<LookupValues>();
  const [useForm] = Form.useForm<UseSubscriptionValues>();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const [subscriptionDetail, setSubscriptionDetail] = useState<Subscription | null>(null);
  const [lookupFeedback, setLookupFeedback] = useState<FeedbackState | null>(null);
  const [useFeedback, setUseFeedback] = useState<FeedbackState | null>(null);

  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setError(null);
      const data = await api.listStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  async function handleStudentSelect(studentId: number | null) {
    setSelectedStudentId(studentId);
    setSelectedStudent(null);

    if (!studentId) {
      return;
    }

    setLoadingStudent(true);
    try {
      const student = await api.getStudent(studentId);
      setSelectedStudent(student);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch student subscriptions',
      );
    } finally {
      setLoadingStudent(false);
    }
  }

  async function handleLookupSubscription(values: LookupValues) {
    try {
      const subscription = await api.getSubscription(values.subscriptionId);
      setSubscriptionDetail(subscription);
      setLookupFeedback({ type: 'success', text: 'Subscription found' });
    } catch (err) {
      setSubscriptionDetail(null);
      setLookupFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fetch subscription',
      });
    }
  }

  async function handleUseSubscription(values: UseSubscriptionValues) {
    try {
      const updated = await api.useSubscription(values.subscriptionId, {
        sessions: values.sessions,
      });
      setUseFeedback({
        type: 'success',
        text: `Updated subscription #${updated.id}. Used: ${updated.usedSessions}/${updated.totalSessions}`,
      });

      if (subscriptionDetail?.id === updated.id) {
        setSubscriptionDetail(updated);
      }

      if (selectedStudentId) {
        await handleStudentSelect(selectedStudentId);
      }
    } catch (err) {
      setUseFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to use subscription',
      });
    }
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <SubscriptionForm
        students={students}
        onCreated={() => {
          if (selectedStudentId) {
            void handleStudentSelect(selectedStudentId);
          }
        }}
      />

      <Card title="View Student Subscriptions" bordered={false}>
        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />}

        <Form layout="vertical">
          <Form.Item label="Student">
            <Select
              allowClear
              placeholder="Select student"
              value={selectedStudentId ?? undefined}
              options={students.map((student) => ({
                label: student.name,
                value: student.id,
              }))}
              onChange={(value) => void handleStudentSelect(value ?? null)}
            />
          </Form.Item>
        </Form>

        {loadingStudent && <Spin />}

        {!loadingStudent && selectedStudent && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Typography.Text strong>
              {selectedStudent.name} ({selectedStudent.currentGrade})
            </Typography.Text>

            <Table
              rowKey="id"
              columns={subscriptionColumns}
              dataSource={selectedStudent.subscriptions || []}
              pagination={false}
              locale={{ emptyText: 'No subscriptions' }}
            />
          </Space>
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Get Subscription by ID" bordered={false}>
            <Form
              form={lookupForm}
              layout="vertical"
              onFinish={handleLookupSubscription}
            >
              <Form.Item
                label="Subscription ID"
                name="subscriptionId"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit">
                  Lookup Subscription
                </Button>
              </Form.Item>
            </Form>

            <FeedbackMessage feedback={lookupFeedback} />

            {subscriptionDetail && (
              <Descriptions bordered size="small" column={1} style={{ marginTop: 12 }}>
                <Descriptions.Item label="ID">{subscriptionDetail.id}</Descriptions.Item>
                <Descriptions.Item label="Package">
                  {subscriptionDetail.packageName}
                </Descriptions.Item>
                <Descriptions.Item label="Usage">
                  {subscriptionDetail.usedSessions}/{subscriptionDetail.totalSessions}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Use Subscription Sessions" bordered={false}>
            <Form
              form={useForm}
              layout="vertical"
              onFinish={handleUseSubscription}
              initialValues={{ sessions: 1 }}
            >
              <Form.Item
                label="Subscription ID"
                name="subscriptionId"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="Sessions to use" name="sessions" rules={[{ required: true }]}> 
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit">
                  Use Sessions
                </Button>
              </Form.Item>
            </Form>

            <FeedbackMessage feedback={useFeedback} />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
