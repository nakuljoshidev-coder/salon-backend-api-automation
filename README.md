# Salon Backend API Automation

Automated API testing project for a salon booking backend using Jest, Supertest, and TypeScript.

## Tech Stack

- Node.js
- TypeScript
- Jest
- Supertest
- Express
- MongoDB
- ts-jest

## APIs Tested

The following APIs were tested:

1. Backend health check
2. User registration
3. User login
4. Fetch available salon slots
5. Create booking
6. Cancel booking

## Test Scenarios

### Positive Scenarios

- Verify backend is running
- Register a new user successfully
- Login with valid credentials
- Fetch available salon slots
- Create a booking with valid authentication
- Cancel a booking successfully

### Negative Scenarios

- Registration with missing fields
- Login with incorrect password
- Login with missing password
- Invalid salon ID
- Booking without authentication
- Booking with invalid token
- Booking with missing fields
- Cancel non-existing booking
- Cancel booking with invalid token

## Project Structure

```text
├── index.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── jest.config.cjs
├── .gitignore
├── tests
│   ├── api.test.ts
│   └── e2e.test.ts
├── routes
├── models
├── middleware
└── utils