'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOutlined, HomeOutlined, TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Layout, Menu, Typography, theme } from 'antd';

const { Header, Content } = Layout;

interface AppShellProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: <Link href="/">Dashboard</Link>,
  },
  {
    key: '/parents',
    icon: <TeamOutlined />,
    label: <Link href="/parents">Parents</Link>,
  },
  {
    key: '/students',
    icon: <UsergroupAddOutlined />,
    label: <Link href="/students">Students</Link>,
  },
  {
    key: '/classes',
    icon: <BookOutlined />,
    label: <Link href="/classes">Classes</Link>,
  },
  {
    key: '/subscriptions',
    icon: <BookOutlined />,
    label: <Link href="/subscriptions">Subscriptions</Link>,
  },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const selectedKey = menuItems.find((item) =>
    pathname === '/' ? item.key === '/' : pathname.startsWith(item.key) && item.key !== '/',
  )?.key || '/';

  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          paddingInline: 16,
          height: 'auto',
          lineHeight: 1.3,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <Typography.Title level={4} style={{ margin: 0, marginBottom: 8 }}>
            TeenCare Mini LMS
          </Typography.Title>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ borderBottom: 'none' }}
          />
        </div>
      </Header>

      <Content style={{ padding: '20px 12px 28px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>{children}</div>
      </Content>
    </Layout>
  );
}
