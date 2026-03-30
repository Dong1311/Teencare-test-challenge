'use client';

import { Card, Empty, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ClassItem, DayOfWeek } from '@/lib/types';

interface WeeklyClassesTableProps {
  classes: ClassItem[];
}

type WeeklyRow = Record<DayOfWeek, ClassItem[]> & { key: string };

const WEEK_DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

function renderClassCell(items: ClassItem[]) {
  if (items.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No classes" />;
  }

  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      {items.map((item) => (
        <Card key={item.id} size="small" style={{ background: '#fafcff' }}>
          <Typography.Text strong>{item.name}</Typography.Text>
          <br />
          <Tag color="blue" style={{ marginTop: 6 }}>
            {item.subject}
          </Tag>
          <Typography.Paragraph style={{ marginBottom: 0, marginTop: 8 }}>
            Teacher: {item.teacherName}
            <br />
            Time: {item.timeSlot}
            <br />
            Registrations: {item.currentRegistrations}/{item.maxStudents}
          </Typography.Paragraph>
        </Card>
      ))}
    </Space>
  );
}

export default function WeeklyClassesTable({ classes }: WeeklyClassesTableProps) {
  const row: WeeklyRow = {
    key: 'week',
    MONDAY: classes.filter((item) => item.dayOfWeek === 'MONDAY'),
    TUESDAY: classes.filter((item) => item.dayOfWeek === 'TUESDAY'),
    WEDNESDAY: classes.filter((item) => item.dayOfWeek === 'WEDNESDAY'),
    THURSDAY: classes.filter((item) => item.dayOfWeek === 'THURSDAY'),
    FRIDAY: classes.filter((item) => item.dayOfWeek === 'FRIDAY'),
    SATURDAY: classes.filter((item) => item.dayOfWeek === 'SATURDAY'),
    SUNDAY: classes.filter((item) => item.dayOfWeek === 'SUNDAY'),
  };

  const columns: ColumnsType<WeeklyRow> = WEEK_DAYS.map((day) => ({
    title: day,
    dataIndex: day,
    key: day,
    width: 260,
    render: (value: ClassItem[]) => renderClassCell(value),
  }));

  return (
    <Table
      bordered
      columns={columns}
      dataSource={[row]}
      pagination={false}
      scroll={{ x: 1800 }}
      size="small"
    />
  );
}
