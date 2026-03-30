import {
  ClassItem,
  Parent,
  Student,
  Subscription,
  Registration,
  ApiEnvelope,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const body = (await response.json()) as ApiEnvelope<T> & {
    message?: string;
  };

  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Request failed');
  }

  return body.data;
}

export const api = {
  listParents: () => request<Parent[]>('/parents'),
  getParent: (id: number) => request<Parent>(`/parents/${id}`),
  createParent: (payload: { name: string; phone: string; email: string }) =>
    request<Parent>('/parents', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listStudents: () => request<Student[]>('/students'),
  getStudent: (id: number) => request<Student>(`/students/${id}`),
  createStudent: (payload: {
    name: string;
    dob: string;
    gender: string;
    currentGrade: string;
    parentId: number;
  }) =>
    request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listClasses: (day?: string) =>
    request<ClassItem[]>(day ? `/classes?day=${encodeURIComponent(day)}` : '/classes'),
  createClass: (payload: {
    name: string;
    subject: string;
    dayOfWeek: string;
    timeSlot: string;
    teacherName: string;
    maxStudents: number;
  }) =>
    request<ClassItem>('/classes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  registerStudent: (classId: number, payload: { studentId: number; classDate: string }) =>
    request<Registration>(`/classes/${classId}/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelRegistration: (registrationId: number) =>
    request<{ registrationId: number; refundedSessions: number }>(
      `/registrations/${registrationId}`,
      {
        method: 'DELETE',
      },
    ),

  createSubscription: (payload: {
    studentId: number;
    packageName: string;
    startDate: string;
    endDate: string;
    totalSessions: number;
    usedSessions?: number;
  }) =>
    request<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSubscription: (id: number) => request<Subscription>(`/subscriptions/${id}`),
  useSubscription: (id: number, payload: { sessions?: number }) =>
    request<Subscription>(`/subscriptions/${id}/use`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
