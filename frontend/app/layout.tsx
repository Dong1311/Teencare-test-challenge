import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'TeenCare Mini LMS',
  description: 'Mini LMS for Product Builder coding test',
};

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/parents', label: 'Parents' },
  { href: '/students', label: 'Students' },
  { href: '/classes', label: 'Classes' },
  { href: '/subscriptions', label: 'Subscriptions' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <h1>TeenCare Mini LMS</h1>
            <nav>
              <ul className="nav-list">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <main className="container">{children}</main>
      </body>
    </html>
  );
}
