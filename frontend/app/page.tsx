'use client';

import Link from 'next/link';
import { Button, Card, Col, Row, Space, Typography } from 'antd';

const features = [
  {
    title: 'Parents',
    description: 'Create and view parent records.',
    href: '/parents',
  },
  {
    title: 'Students',
    description: 'Create students under a parent and view details.',
    href: '/students',
  },
  {
    title: 'Classes',
    description: 'Create classes, view weekly schedule, and register students.',
    href: '/classes',
  },
  {
    title: 'Subscriptions',
    description: 'Create and inspect student subscriptions.',
    href: '/subscriptions',
  },
];

export default function HomePage() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card bordered={false}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Dashboard
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          This mini LMS supports parent/student management, class scheduling,
          subscription usage, class registration rules, and cancellation with
          refund logic.
        </Typography.Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        {features.map((feature) => (
          <Col key={feature.href} xs={24} md={12} lg={12}>
            <Card title={feature.title} bordered={false}>
              <Typography.Paragraph>{feature.description}</Typography.Paragraph>
              <Link href={feature.href}>
                <Button type="primary">Go to {feature.title}</Button>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
