# Campusly

Campusly is a full-stack web application with a Next.js frontend and a NestJS + PostgreSQL backend, designed to manage campus-related activities.

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** NestJS, Prisma ORM
- **Database:** PostgreSQL
- **Infrastructure:** Docker, Docker Compose

## Prerequisites

- Node.js (v18 or higher recommended)
- Docker and Docker Compose (for running the database and optionally the backend)
- npm or yarn or pnpm

## Getting Started

### 1. Database Setup (Docker)

You can spin up the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d db
```

This will start a PostgreSQL instance on port `5432` with the database `campusly`.

### 2. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Set up your `.env` file (if not already present, you can copy from a template or use the default provided in docker-compose). Ensure `DATABASE_URL` is set correctly:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusly?schema=public"
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
```

Run Prisma migrations and seed the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the backend development server:

```bash
npm run start:dev
```

The backend will be available at [http://localhost:3002](http://localhost:3002).

### 3. Frontend Setup

Open a new terminal and navigate to the project root:

```bash
# In the root directory (c:\Users\VICTUS\Documents\formidble\anti)
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Full Stack via Docker

To run both the database and the backend using Docker Compose:

```bash
docker-compose up -d
```

You can then run the frontend locally using `npm run dev` in the root directory.

## Contributing

Make sure to format and lint your code before pushing:

```bash
npm run lint
```
