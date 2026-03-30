# TeenCare Mini LMS

A mini LMS-style web application for managing parents, students, classes, subscriptions, and class registrations with practical business rules.

## 1) Project Overview

This project includes:
- `backend`: NestJS + Prisma + PostgreSQL REST API
- `frontend`: Next.js App Router UI
- `postgres`: persistent database

Core capabilities:
- Create and view parents, students, classes, subscriptions
- Register a student into a class with validation rules
- Cancel registration with conditional refund logic
- Weekly classes view and simple registration UI

## 2) Tech Stack

- Frontend: Next.js 14+, React, TypeScript
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- DevOps: Docker, docker-compose

## 3) Folder Structure

```text
root/
  docker-compose.yml
  README.md
  .env.example
  backend/
    Dockerfile
    package.json
    nest-cli.json
    tsconfig.json
    tsconfig.build.json
    prisma/
      schema.prisma
      seed.ts
      migrations/
        20260330000000_init/
          migration.sql
    src/
      main.ts
      app.module.ts
      prisma/
        prisma.module.ts
        prisma.service.ts
      common/
        filters/
          http-exception.filter.ts
        interceptors/
          response.interceptor.ts
      parents/
        parents.module.ts
        parents.controller.ts
        parents.service.ts
        dto/
          create-parent.dto.ts
      students/
        students.module.ts
        students.controller.ts
        students.service.ts
        dto/
          create-student.dto.ts
      classes/
        classes.module.ts
        classes.controller.ts
        classes.service.ts
        dto/
          create-class.dto.ts
          register-student.dto.ts
      subscriptions/
        subscriptions.module.ts
        subscriptions.controller.ts
        subscriptions.service.ts
        dto/
          create-subscription.dto.ts
          use-subscription.dto.ts
      registrations/
        registrations.module.ts
        registrations.controller.ts
        registrations.service.ts
  frontend/
    Dockerfile
    package.json
    tsconfig.json
    next.config.js
    next-env.d.ts
    app/
      globals.css
      layout.tsx
      page.tsx
      parents/page.tsx
      students/page.tsx
      classes/page.tsx
      subscriptions/page.tsx
    components/
      ParentForm.tsx
      StudentForm.tsx
      SubscriptionForm.tsx
      WeeklyClassesTable.tsx
      RegisterStudentForm.tsx
      FeedbackMessage.tsx
    lib/
      api.ts
      types.ts
```

## 4) Database Schema Summary

Main tables:
- `Parent`
- `Student` (belongs to Parent)
- `Class`
- `Subscription` (belongs to Student)
- `ClassRegistration` (links Student ? Class)

Important constraints:
- `Parent.email` is unique
- `ClassRegistration` unique `(classId, studentId)`
- FK relations with Prisma-managed constraints

Pragmatic schema extension for cancellation/refund logic:
- `ClassRegistration.classDate` (actual calendar date selected during registration)
- `ClassRegistration.subscriptionIdUsed` (which subscription consumed 1 session)

## 5) Setup Instructions (Local Without Docker)

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL

### Steps
1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Set `DATABASE_URL` in backend environment.
3. Install backend deps:
   ```bash
   cd backend && npm install
   ```
4. Run migration + seed:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```
5. Start backend:
   ```bash
   npm run start:dev
   ```
6. Install/start frontend:
   ```bash
   cd ../frontend && npm install && npm run dev
   ```

## 6) Run With Docker

From project root:

```bash
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api
- PostgreSQL: localhost:5432

## 7) Main API Endpoints

### Parents
- `POST /api/parents`
- `GET /api/parents`
- `GET /api/parents/:id`

### Students
- `POST /api/students`
- `GET /api/students`
- `GET /api/students/:id` (includes parent)

### Classes
- `POST /api/classes`
- `GET /api/classes`
- `GET /api/classes?day=MONDAY`
- `POST /api/classes/:classId/register`

### Registrations
- `DELETE /api/registrations/:id`

### Subscriptions
- `POST /api/subscriptions`
- `PATCH /api/subscriptions/:id/use`
- `GET /api/subscriptions/:id`

## 8) Seed Data Summary

Seed includes:
- 2 parents (`Nguyen Van A`, `Tran Thi B`)
- 3 students (2 under parent 1, 1 under parent 2)
- 3 classes (Math/English/Science)
- 2 active subscriptions (student 1 and student 2)

## 9) Business Rule Notes

### Registration (`POST /api/classes/:classId/register`)
Validation applied:
- Class capacity (`maxStudents`) is not exceeded
- No schedule conflict with student's existing registered classes
- Student must have at least one active subscription:
  - current date within `[startDate, endDate]`
  - `usedSessions < totalSessions`
- If multiple active subscriptions exist, earliest `endDate` is used first
- On success, `usedSessions` increments by 1

### Cancellation (`DELETE /api/registrations/:id`)
- Registration is deleted
- If cancellation is more than 24 hours before class start (`classDate + timeSlot start`), one session is refunded to `subscriptionIdUsed`
- If within 24 hours, no refund

## 10) curl Examples

### Create parent
```bash
curl -X POST http://localhost:3001/api/parents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pham Van C",
    "phone": "0901234567",
    "email": "pham.c@example.com"
  }'
```

### Create student
```bash
curl -X POST http://localhost:3001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pham Thi D",
    "dob": "2014-06-15",
    "gender": "FEMALE",
    "currentGrade": "Grade 6",
    "parentId": 1
  }'
```

### Create class
```bash
curl -X POST http://localhost:3001/api/classes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Math Foundation",
    "subject": "Math",
    "dayOfWeek": "MONDAY",
    "timeSlot": "09:00-10:30",
    "teacherName": "Ms. Lan",
    "maxStudents": 20
  }'
```

### Create subscription
```bash
curl -X POST http://localhost:3001/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "packageName": "12-session package",
    "startDate": "2026-03-01",
    "endDate": "2026-06-30",
    "totalSessions": 12,
    "usedSessions": 0
  }'
```

### Register student to class
```bash
curl -X POST http://localhost:3001/api/classes/1/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "classDate": "2026-04-03"
  }'
```

### Cancel registration
```bash
curl -X DELETE http://localhost:3001/api/registrations/1
```

### Get student detail
```bash
curl http://localhost:3001/api/students/1
```

### Get subscription detail
```bash
curl http://localhost:3001/api/subscriptions/1
```

## 11) Trade-offs and Future Improvements

Trade-offs:
- Schedule conflict checks compare parsed timeslots in a pragmatic way for interview scope.
- `classDate` is stored in registration instead of redesigning class recurrence model.
- Uses REST-only endpoints and minimal UI for demo clarity.

Possible improvements:
- Add authentication/authorization and role separation
- Add pagination/filtering for list endpoints
- Add richer class recurrence and calendar model
- Add E2E tests and CI pipeline
- Improve timezone handling strategy for class scheduling
