# EventHub API

[![CI](https://github.com/VictorSDS2801/eventhub-api/actions/workflows/ci.yml/badge.svg)](https://github.com/VictorSDS2801/eventhub-api/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?logo=redis&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

> 🇧🇷 [Leia em Português](./README.pt-BR.md)

A robust event registration and management platform built with **Clean Architecture**, **Domain-Driven Design (DDD)**, and a full async notification pipeline.

## Overview

EventHub is a portfolio project designed to demonstrate production-grade backend architecture. Users can create events, manage registrations with automatic waitlist promotion, perform check-ins, and receive email notifications — all backed by a clean, testable domain layer.

**Key features:**
- JWT authentication with Role-Based Access Control (RBAC)
- Event management with capacity control
- Enrollment with automatic waitlist queue and late cancellation rules
- Event check-in with time window validation
- Async email notifications via BullMQ + Nodemailer (Ethereal)
- Redis cache on event listings (cache-aside pattern)
- Modular monolith architecture — domain boundaries drawn for future microservice extraction

## Architecture

```
src/
├── application/          # HTTP layer (controllers, DTOs)
│   ├── controllers/
│   │   ├── auth/
│   │   ├── event/
│   │   ├── enrollment/
│   │   └── check-in/
│   └── dtos/
│       ├── auth/
│       ├── event/
│       ├── enrollment/
│       └── check-in/
├── domain/               # Business logic (pure, no framework dependencies)
│   ├── entities/
│   │   ├── event/        # Event, Capacity VO, EventStatus VO
│   │   ├── enrollment/   # Enrollment, EnrollmentStatus VO
│   │   ├── user/         # User, Email VO, Role VO
│   │   └── check-in/     # CheckIn
│   ├── services/         # Use cases (orchestrate entities + repositories)
│   ├── repositories/     # Repository interfaces (ports)
│   ├── ports/            # External integration interfaces (cache, notification, token, password)
│   └── exceptions/       # Domain-specific exceptions
└── infrastructure/       # Framework + external adapters
    ├── database/         # Mongoose schemas, mappers, repository implementations
    ├── adapters/         # Redis cache, BullMQ notification, bcrypt, JWT
    ├── queue/            # BullMQ worker (email processor)
    └── shared/           # Guards, decorators, config

test/
└── unit/                 # Unit tests mirroring src/ structure
```

### Dependency rule

```
Presentation → Application → Domain ← Infrastructure
```

The domain layer has zero dependencies on frameworks or infrastructure. Repositories and external ports are defined as interfaces in the domain and implemented in the infrastructure layer, injected via NestJS DI tokens.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS + TypeScript |
| Database | MongoDB + Mongoose |
| Cache | Redis (ioredis) |
| Queue | BullMQ |
| Email | Nodemailer + Ethereal (test) |
| Auth | JWT (RS256 via @nestjs/jwt) |
| Password hashing | bcrypt |
| Testing | Jest (unit tests, 60+ tests) |
| CI | GitHub Actions |
| Containers | Docker Compose (MongoDB + Redis) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker + Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/VictorSDS2801/eventhub-api.git
cd eventhub-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your values (the defaults work for local development):

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventhub
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=1d
CACHE_TTL_SECONDS=60
```

### 4. Start infrastructure (MongoDB + Redis)

```bash
docker compose up -d
```

### 5. Run the application

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### 6. Run tests

```bash
npm run test
```

## API Overview

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register a user | — |
| POST | `/auth/login` | Authenticate and get JWT | — |

### Events
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/events` | Create an event | ORGANIZER / ADMIN |
| GET | `/events` | List events (cached) | — |
| GET | `/events/:id` | Get event by ID | — |
| PATCH | `/events/:id/publish` | Publish an event | ORGANIZER / ADMIN |
| PATCH | `/events/:id/cancel` | Cancel an event | ORGANIZER / ADMIN |

### Enrollments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/enrollments` | Enroll in an event | Any authenticated user |
| PATCH | `/enrollments/:id/cancel` | Cancel enrollment | Any authenticated user |
| GET | `/enrollments/event/:eventId` | List enrollments for event | Any authenticated user |

### Check-in
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/check-ins/enrollment/:enrollmentId` | Perform check-in | Any authenticated user |
| GET | `/check-ins/event/:eventId` | List check-ins for event | Any authenticated user |

## Key Domain Rules

**Enrollment with waitlist:**
When an event reaches full capacity, new enrollments are automatically placed on a waiting list with a sequential position. When a confirmed enrollment is cancelled, the first person on the waitlist is automatically promoted and notified by email.

**Late cancellation rule:**
Cancellations made within 12 hours of the event start time will not trigger automatic waitlist promotion. The spot is released but no one is promoted — not enough time for a substitute to prepare.

**Check-in window:**
Check-in is only allowed during the event's time window (between `startDate` and `endDate`). Duplicate check-ins for the same enrollment are rejected.

**Cache invalidation:**
The event listing endpoint is cached in Redis with a 60-second TTL. The cache is invalidated whenever an event is created, published, or cancelled, ensuring consistency.

## Architectural Decisions

**Modular monolith over microservices:** The domain boundaries (Identity, Event, Enrollment, Check-in) are drawn as clearly separated contexts, but run in a single process. This was a deliberate choice — the bounded contexts are clean enough to extract into microservices if scale ever requires it, but the operational complexity of distributed systems is not justified for this stage.

**Cache in the Application layer, not the Domain:** The `EventController` owns the cache logic (reading/writing `EventResponseDto`), not the `EventService`. This keeps the domain layer free of infrastructure concerns, respecting the dependency rule.

**`create()` vs `restore()` on entities:** Every aggregate has two factory methods. `create()` applies all business invariants (e.g., "event start date cannot be in the past"). `restore()` reconstructs an existing aggregate from persistence without re-applying creation rules — used by mappers and tests simulating existing state.

**Ports & Adapters for all external dependencies:** bcrypt, JWT, Redis, and BullMQ are never imported directly in the domain. Each has an interface (port) in the domain layer and a concrete adapter in infrastructure. This makes the domain 100% testable with mocks and decoupled from specific libraries.

## License

MIT — feel free to use this project as a reference or starting point.
