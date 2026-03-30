export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface Parent {
  id: number;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: number;
  name: string;
  dob: string;
  gender: Gender;
  currentGrade: string;
  parentId: number;
  parent?: Parent;
  subscriptions?: Subscription[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassItem {
  id: number;
  name: string;
  subject: string;
  dayOfWeek: DayOfWeek;
  timeSlot: string;
  teacherName: string;
  maxStudents: number;
  currentRegistrations: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  studentId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  usedSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: number;
  classId: number;
  studentId: number;
  classDate: string;
  subscriptionIdUsed?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface FeedbackState {
  type: 'success' | 'error';
  text: string;
}
