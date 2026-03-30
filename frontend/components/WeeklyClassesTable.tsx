'use client';

import { ClassItem, DayOfWeek } from '@/lib/types';

interface WeeklyClassesTableProps {
  classes: ClassItem[];
}

const WEEK_DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export default function WeeklyClassesTable({ classes }: WeeklyClassesTableProps) {
  const grouped = WEEK_DAYS.reduce<Record<DayOfWeek, ClassItem[]>>(
    (accumulator, day) => {
      accumulator[day] = classes.filter((item) => item.dayOfWeek === day);
      return accumulator;
    },
    {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: [],
    },
  );

  return (
    <div className="table-scroll">
      <table className="weekly-table">
        <thead>
          <tr>
            {WEEK_DAYS.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {WEEK_DAYS.map((day) => (
              <td key={day}>
                {grouped[day].length === 0 ? (
                  <p className="muted">No classes</p>
                ) : (
                  grouped[day].map((item) => (
                    <div key={item.id} className="class-card">
                      <strong>{item.name}</strong>
                      <p>Subject: {item.subject}</p>
                      <p>Teacher: {item.teacherName}</p>
                      <p>Time: {item.timeSlot}</p>
                      <p>
                        Registrations: {item.currentRegistrations}/{item.maxStudents}
                      </p>
                    </div>
                  ))
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
