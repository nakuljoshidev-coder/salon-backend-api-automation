# Salon Booking API — Jest Automation Suite

This repository contains the salon booking backend (Node.js / Express / TypeScript /
MongoDB via Mongoose) plus a Jest + Supertest API automation suite covering the
full customer journey: **Register → Login → View available slots → Book → Cancel**,
along with negative, authentication, and authorization scenarios.

> **Security note:** the original `index.ts` in this repo contained an obfuscated
> `eval(...)` payload appended after the normal server startup code. It has been
> removed. If you pulled this project from elsewhere, treat that source as
> compromised and do not run its original `index.ts` unreviewed.

---

## Prerequisites

- **Node.js**: v18 or later (developed/tested on Node v22)
- **npm**: v9+ (ships with Node)
- **MongoDB**: only required to *run the live application* (`npm run dev` /
  `npm start`). **The automated test suite does not require MongoDB, Docker, or
  any external service** — see "Test configuration & assumptions" below.

## Project structure (relevant parts)

```
app.ts                     # Express app (routes/middleware), no side effects — imported by index.ts and by tests
index.ts                   # Entry point: loads env vars, connects to MongoDB, starts the HTTP server
controllers/                # register/login, booking, salon-availability business logic
middleware/auth.ts          # JWT auth middleware
models/                     # Mongoose schemas (User, Salon, Service, Booking)
routes/                      # Express routers
tests/
  auth.test.ts               # Register / Login — positive & negative
  booking.test.ts             # Full E2E flow, auth/authz, booking business rules
  salon.test.ts                # Available-slots endpoint
  helpers.ts                    # Shared test utilities (register/login, seeding)
  setup.ts                       # Global afterEach reset (setupFilesAfterEnv)
  mocks/models/                   # In-memory Mongoose-model test doubles (see below)
jest.config.js
```

---

## Environment Setup

The live application reads the following variables (via `dotenv`), typically
from a `.env` file in the project root:

| Variable      | Required | Default (if unset)                     | Purpose                              |
|---------------|----------|------------------------------------------|---------------------------------------|
| `MONGO_URI`   | No       | `mongodb://localhost:27017/salon-db`     | MongoDB connection string             |
| `PORT`        | No       | `3000`                                   | HTTP port the server listens on       |
| `JWT_SECRET`  | No       | `supersecretjwtkey_12345`                | Secret used to sign/verify JWTs       |

Example `.env`:

```
MONGO_URI=mongodb://localhost:27017/salon-db
PORT=3000
JWT_SECRET=replace-with-a-long-random-string
```

**Setup assumption:** in production/staging you should always set `JWT_SECRET`
explicitly — the fallback value is only meant for quick local runs.

The **test suite does not read or require any of these variables** — it never
opens a real network or database connection (see next section).

---

## Run Tests

```bash
npm install
npm test
```

This runs the full Jest suite (`jest --runInBand`) — 22 tests across 3 suites,
covering:

- **Auth** — successful registration/login, duplicate email, missing password,
  wrong password, non-existent user, role can't be self-escalated at
  registration.
- **Salon availability** — missing query params, unknown salon/service,
  correct slot generation within opening hours.
- **Booking E2E + rules** — full register → login → check slots → book →
  cancel flow; missing/invalid auth token (401); missing `date` (400);
  unknown service (404); double-booking the same slot (400); cancelling
  someone else's booking (403); cancelling as the owner (200); cancelling as
  an `admin` (200, role-based authorization); cancelling twice (400);
  cancelling a booking that doesn't exist (404).

Other scripts:

```bash
npm run test:watch   # re-run on file changes
npm run build        # tsc type-check + compile to dist/
```

### Test configuration & assumptions

- **No live database needed.** The controllers/middleware are exercised
  through real HTTP requests (via `supertest`) against the real Express `app`
  (`app.ts`), but the Mongoose *model* layer (`models/User.ts`, `Salon.ts`,
  `Service.ts`, `Booking.ts`) is swapped, **only inside the Jest process**,
  for a small in-memory equivalent (`tests/mocks/models/`) using Jest's
  `moduleNameMapper`. Production code is completely unmodified — nothing in
  `controllers/`, `middleware/`, or `models/` imports from `tests/`.
  - Rationale: the standard alternative (`mongodb-memory-server`) downloads a
    real `mongod` binary from `fastdl.mongodb.org` on first run. That works
    fine on a normal machine or CI runner with outbound internet access, but
    makes the suite non-deterministic/slow on first run and unusable on
    network-restricted machines. The in-memory double keeps the suite fast,
    zero-config, and 100% deterministic while still testing real HTTP status
    codes, response bodies, auth/authz, and business-rule logic end-to-end.
  - If you'd rather test against a real MongoDB instance, swap
    `tests/mocks/models/*` for `mongodb-memory-server` (or a real `MONGO_URI`)
    and remove the `moduleNameMapper` entry in `jest.config.js` — the
    controllers and test assertions do not need to change.
- **Setup/teardown**: `tests/setup.ts` (wired via Jest's
  `setupFilesAfterEnv`) resets the in-memory store after every individual
  test (`afterEach`), so tests are isolated and can run in any order.
- **Seeding roles**: the API only allows self-registration as `customer`
  (by design — see `authController.ts`). Since there's no public endpoint to
  create a `stylist` or `admin`, tests create those directly against the
  (mocked) `User` model and log them in through the real `/api/login`
  endpoint — this exercises real login logic for every role while working
  around the intentional lack of a public "create stylist/admin" endpoint.
- **TypeScript version pinned to `^5.7.x`** in `devDependencies` — the
  original `^7.0.2` is a pre-release line not yet supported by `ts-jest`.
  Application code did not need any changes for this.
