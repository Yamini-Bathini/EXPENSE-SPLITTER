# Expense Splitter

Full-stack Expense Splitter app with Spring Boot backend and React + Vite frontend.

## Quick start

From the project root:

```bash
npm install
npm start
```

The app runs:
- Backend: http://localhost:8080
- Frontend: http://localhost:5173

## MySQL configuration

The backend now uses MySQL. Create a database named `expenses` and set your MySQL credentials with environment variables if needed.

Example:

```bash
set MYSQL_URL=jdbc:mysql://localhost:3306/expenses?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
set MYSQL_USER=root
set MYSQL_PASSWORD=your-password
npm start
```

If you don’t set an environment variable, the defaults are:
- `MYSQL_URL=jdbc:mysql://localhost:3306/expenses?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
- `MYSQL_USER=root`
- `MYSQL_PASSWORD=password`

To start both services from the project root:

```bash
npm start
```

To start only one service:

```bash
npm run backend
npm run frontend
```

If you only need the frontend and the backend is already running, use `npm run frontend`.

## Auth and seed data

The app now shows a login/signup screen first. Username and password are required for signup and login.

You can sign up with any name, email, and password, or use seeded sample accounts from the backend data seed:

- `alice@example.com` / `password123`
- `ben@example.com` / `password123`
- `clara@example.com` / `password123`

## Structure

- `backend/` - Spring Boot API with Hibernate JPA, H2 database, sample data, and REST endpoints.
- `frontend/` - React + Vite app with Tailwind, TypeScript, Axios, charts, and animations.
