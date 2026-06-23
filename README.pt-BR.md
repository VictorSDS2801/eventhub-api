# EventHub API

[![CI](https://github.com/VictorSDS2801/eventhub-api/actions/workflows/ci.yml/badge.svg)](https://github.com/VictorSDS2801/eventhub-api/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?logo=redis&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

> 🇺🇸 [Read in English](./README.md)

Plataforma robusta de gestão e inscrição em eventos, construída com **Clean Architecture**, **Domain-Driven Design (DDD)** e um pipeline completo de notificações assíncronas.

## Visão Geral

O EventHub é um projeto de portfólio desenvolvido para demonstrar arquitetura backend de nível produção. Usuários podem criar eventos, gerenciar inscrições com promoção automática de lista de espera, realizar check-in e receber notificações por e-mail — tudo sustentado por uma camada de domínio limpa e testável.

**Funcionalidades principais:**
- Autenticação JWT com Controle de Acesso Baseado em Papéis (RBAC)
- Gestão de eventos com controle de capacidade
- Inscrições com fila de lista de espera automática e regra de cancelamento tardio
- Check-in com validação de janela de tempo do evento
- Notificações assíncronas por e-mail via BullMQ + Nodemailer (Ethereal)
- Cache Redis na listagem de eventos (padrão cache-aside)
- Arquitetura de monolito modular — fronteiras de domínio desenhadas para extração futura em microsserviços

## Arquitetura

```
src/
├── application/          # Camada HTTP (controllers, DTOs)
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
├── domain/               # Regras de negócio (puras, sem dependências de framework)
│   ├── entities/
│   │   ├── event/        # Event, Capacity VO, EventStatus VO
│   │   ├── enrollment/   # Enrollment, EnrollmentStatus VO
│   │   ├── user/         # User, Email VO, Role VO
│   │   └── check-in/     # CheckIn
│   ├── services/         # Casos de uso (orquestram entidades + repositórios)
│   ├── repositories/     # Interfaces de repositório (ports)
│   ├── ports/            # Interfaces de integração externa (cache, notificação, token, senha)
│   └── exceptions/       # Exceções específicas de domínio
└── infrastructure/       # Framework + adaptadores externos
    ├── database/         # Schemas Mongoose, mappers, implementações de repositório
    ├── adapters/         # Cache Redis, notificação BullMQ, bcrypt, JWT
    ├── queue/            # Worker BullMQ (processador de e-mail)
    └── shared/           # Guards, decorators, config

test/
└── unit/                 # Testes unitários espelhando a estrutura de src/
```

### Regra de dependência

```
Apresentação → Aplicação → Domínio ← Infraestrutura
```

A camada de domínio não possui nenhuma dependência de frameworks ou infraestrutura. Repositórios e ports externos são definidos como interfaces no domínio e implementados na infraestrutura, injetados via tokens de DI do NestJS.

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | NestJS + TypeScript |
| Banco de dados | MongoDB + Mongoose |
| Cache | Redis (ioredis) |
| Fila | BullMQ |
| E-mail | Nodemailer + Ethereal (teste) |
| Autenticação | JWT via @nestjs/jwt |
| Hash de senha | bcrypt |
| Testes | Jest (testes unitários, 60+ testes) |
| CI | GitHub Actions |
| Containers | Docker Compose (MongoDB + Redis) |

## Como Executar

### Pré-requisitos

- Node.js 20+
- npm
- Docker + Docker Compose

### 1. Clone o repositório

```bash
git clone https://github.com/VictorSDS2801/eventhub-api.git
cd eventhub-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com seus valores (os padrões já funcionam para desenvolvimento local):

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventhub
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu-segredo-aqui
JWT_EXPIRES_IN=1d
CACHE_TTL_SECONDS=60
```

### 4. Suba a infraestrutura (MongoDB + Redis)

```bash
docker compose up -d
```

### 5. Execute a aplicação

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

### 6. Execute os testes

```bash
npm run test
```

## Endpoints Principais

### Auth
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/register` | Registrar usuário | — |
| POST | `/auth/login` | Autenticar e obter JWT | — |

### Eventos
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/events` | Criar evento | ORGANIZER / ADMIN |
| GET | `/events` | Listar eventos (com cache) | — |
| GET | `/events/:id` | Buscar evento por ID | — |
| PATCH | `/events/:id/publish` | Publicar evento | ORGANIZER / ADMIN |
| PATCH | `/events/:id/cancel` | Cancelar evento | ORGANIZER / ADMIN |

### Inscrições
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/enrollments` | Inscrever-se num evento | Qualquer autenticado |
| PATCH | `/enrollments/:id/cancel` | Cancelar inscrição | Qualquer autenticado |
| GET | `/enrollments/event/:eventId` | Listar inscrições do evento | Qualquer autenticado |

### Check-in
| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/check-ins/enrollment/:enrollmentId` | Realizar check-in | Qualquer autenticado |
| GET | `/check-ins/event/:eventId` | Listar check-ins do evento | Qualquer autenticado |

## Regras de Domínio Principais

**Inscrição com lista de espera:**
Quando um evento atinge capacidade máxima, novas inscrições são automaticamente colocadas em lista de espera com posição sequencial. Quando uma inscrição confirmada é cancelada, o primeiro da lista de espera é promovido automaticamente e notificado por e-mail.

**Regra de cancelamento tardio:**
Cancelamentos realizados dentro de 12 horas antes do início do evento não disparam a promoção automática da lista de espera. A vaga é liberada, mas ninguém é promovido — tempo insuficiente para um suplente se preparar.

**Janela de check-in:**
O check-in só é permitido durante a janela de tempo do evento (entre `startDate` e `endDate`). Check-ins duplicados para a mesma inscrição são rejeitados.

**Invalidação de cache:**
O endpoint de listagem de eventos é cacheado no Redis com TTL de 60 segundos. O cache é invalidado sempre que um evento é criado, publicado ou cancelado, garantindo consistência.

## Decisões Arquiteturais

**Monolito modular em vez de microsserviços:** As fronteiras de domínio (Identity, Event, Enrollment, Check-in) estão claramente separadas como contextos delimitados, mas rodam em um único processo. Essa foi uma decisão consciente — os bounded contexts estão suficientemente limpos para serem extraídos em microsserviços se a escala exigir, mas a complexidade operacional de sistemas distribuídos não se justifica nessa fase.

**Cache na camada Application, não no Domain:** O `EventController` é responsável pela lógica de cache (leitura/escrita do `EventResponseDto`), não o `EventService`. Isso mantém a camada de domínio livre de preocupações de infraestrutura, respeitando a regra de dependência.

**`create()` vs `restore()` nas entidades:** Todo agregado tem dois métodos de fábrica. `create()` aplica todas as invariantes de negócio (ex: "data de início do evento não pode estar no passado"). `restore()` reconstrói um agregado existente a partir da persistência sem reaplicar as regras de criação — usado por mappers e testes que simulam estado já existente.

**Ports & Adapters para todas as dependências externas:** bcrypt, JWT, Redis e BullMQ nunca são importados diretamente no domínio. Cada um tem uma interface (port) na camada de domínio e um adapter concreto na infraestrutura. Isso torna o domínio 100% testável com mocks e desacoplado de bibliotecas específicas.

## Licença

MIT — sinta-se à vontade para usar este projeto como referência ou ponto de partida.
