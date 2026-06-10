# NovaNode

Professional Infrastructure Management Platform for Pterodactyl Ecosystems

Created by PanduAsmara

Status: Planning

---

# Executive Summary

NovaNode adalah platform manajemen infrastruktur yang dirancang untuk mengotomatisasi deployment, monitoring, maintenance, dan operasional ekosistem Pterodactyl.

NovaNode bertindak sebagai control center yang mengelola seluruh infrastruktur hosting dari satu dashboard terpusat.

Target pengguna:

- Hosting Provider
- Minecraft Hosting
- VPS Provider
- Game Hosting
- Internal Infrastructure Team
- Homelab Enthusiast

---

# Vision

Menjadi platform open-source terbaik untuk mengelola ekosistem Pterodactyl secara otomatis, aman, dan terpusat.

---

# Core Principles

- Simple
- Fast
- Secure
- Automated
- Scalable
- Open Source

---

# Product Goals

## Primary Goals

- Centralized Infrastructure Management
- Deployment Automation
- Monitoring & Alerting
- Security Enhancement
- Resource Visibility

## Secondary Goals

- Multi Node Management
- Multi Location Management
- Backup Monitoring
- Service Monitoring
- API First Architecture

---

# User Roles

## Owner

Hak akses penuh.

Dapat:

- Mengelola seluruh sistem
- Mengelola user
- Menghapus data
- Mengatur konfigurasi global

---

## Admin

Dapat:

- Mengelola node
- Mengelola allocation
- Mengelola installer
- Mengelola monitoring

---

## Staff

Dapat:

- Melihat monitoring
- Membantu troubleshooting

---

## Viewer

Read-only access.

---

# Authentication

## First Setup Wizard

NovaNode tidak memiliki default login.

Saat instalasi pertama:

Jika database kosong maka sistem akan menampilkan Setup Wizard.

Administrator wajib membuat:

- Full Name
- Username
- Email
- Password
- Confirm Password

User pertama otomatis menjadi:

ROLE_OWNER

---

## Login

Menggunakan:

- Email
- Password

Authentication:

- JWT Access Token
- Refresh Token

Password:

- bcrypt hashing

---

## Future Security Features

- Two Factor Authentication
- Session Management
- Device Tracking
- Login Audit

---

# Core Modules

## Dashboard

Menampilkan:

- Total Nodes
- Total Servers
- Total Allocations
- Online Nodes
- Offline Nodes
- CPU Usage
- RAM Usage
- Disk Usage

---

## User Management

Fitur:

- Create User
- Edit User
- Delete User
- Assign Roles
- Disable User

---

## Node Management

Fitur:

- Create Node
- Edit Node
- Delete Node
- Sync Node
- Health Check
- Connection Test

---

## Allocation Management

Fitur:

- Import Allocations
- Create Allocation
- Delete Allocation
- Bulk Management

---

## Pterodactyl Integration

Fitur:

- Connect Existing Panel
- Sync Nodes
- Sync Allocations
- Sync Locations
- Sync Eggs

---

## Wings Management

Fitur:

- Install Wings
- Update Wings
- Restart Wings
- Remove Wings
- Health Check

---

## Installer

Supported Operating Systems:

- Ubuntu 22.04
- Ubuntu 24.04
- Debian 12

Supported Components:

- Docker
- MariaDB
- PostgreSQL
- Redis
- Nginx
- Pterodactyl Panel
- Wings

Features:

- One Click Install
- One Click Repair
- One Click Update

---

## Monitoring

Resource Monitoring:

- CPU
- RAM
- Disk
- Network

Service Monitoring:

- Docker
- Wings
- Panel
- Redis
- Database

Refresh Mode:

- Real Time

---

## Alerting

Supported Providers:

- Telegram
- Discord
- Email

Triggers:

- High CPU
- High RAM
- Low Disk
- Node Offline
- Wings Offline
- Service Down

---

## Logs Management

Fitur:

- Application Logs
- Installer Logs
- Node Logs
- Audit Logs

---

## Backup Monitoring

Fitur:

- Backup Status
- Backup History
- Failed Backup Detection
- Storage Usage

---

# Database Design

## users

| Field | Type |
|---------|---------|
| id | uuid |
| name | varchar |
| username | varchar |
| email | varchar |
| password_hash | text |
| role | enum |
| is_active | boolean |
| created_at | timestamp |
| updated_at | timestamp |

---

## nodes

| Field | Type |
|---------|---------|
| id | uuid |
| name | varchar |
| fqdn | varchar |
| location | varchar |
| token | text |
| status | varchar |
| created_at | timestamp |

---

## allocations

| Field | Type |
|---------|---------|
| id | uuid |
| node_id | uuid |
| ip | varchar |
| port | integer |

---

## installations

| Field | Type |
|---------|---------|
| id | uuid |
| target_ip | varchar |
| service | varchar |
| status | varchar |
| created_at | timestamp |

---

## audit_logs

| Field | Type |
|---------|---------|
| id | uuid |
| user_id | uuid |
| action | text |
| created_at | timestamp |

---

# Technical Architecture

## Frontend

- Next.js
- TypeScript
- TailwindCSS
- Shadcn UI

---

## Backend

- NestJS
- TypeScript

---

## Database

- PostgreSQL

---

## ORM

- Prisma ORM

---

## Queue

- BullMQ
- Redis

---

## Monitoring

- Prometheus
- Grafana (Optional)

---

## Containerization

- Docker
- Docker Compose

---

# API Structure

Base URL

/api/v1

---

## Authentication

POST /auth/login

POST /auth/refresh

POST /auth/logout

GET /auth/profile

---

## Users

GET /users

POST /users

PATCH /users/:id

DELETE /users/:id

---

## Nodes

GET /nodes

POST /nodes

PATCH /nodes/:id

DELETE /nodes/:id

---

## Allocations

GET /allocations

POST /allocations

DELETE /allocations/:id

---

## Installer

POST /installer/panel

POST /installer/wings

POST /installer/update

POST /installer/repair

GET /installer/logs

---

## Monitoring

GET /monitoring/resources

GET /monitoring/services

GET /monitoring/nodes

---

# Security Requirements

Mandatory:

- JWT Authentication
- Password Hashing
- Refresh Tokens
- HTTPS Only
- Helmet
- CORS Protection
- Rate Limiting
- Audit Logging

---

# Branding

Product Name:

NovaNode

Founder:

PanduAsmara

Required Credit:

Created by PanduAsmara

Credit harus muncul pada:

- README.md
- Login Page Footer
- Setup Wizard Footer
- Dashboard Footer
- API Documentation Footer

---

# Repository Structure

```
NovaNode/
├── apps/
│   ├── api/          # NestJS — REST API (/api/v1)
│   ├── web/          # Next.js — Dashboard
│   └── installer/    # Deployment engine (bash builder)
├── packages/
│   ├── database/     # Prisma schema + client
│   ├── sdk/          # Typed API client
│   └── shared/       # Tipe & konstanta bersama
├── docker/           # docker-compose (Postgres + Redis)
├── docs/             # Dokumentasi & aset brand
├── scripts/
├── PRD.md            # Product Requirements Document
└── README.md
```

---

# Roadmap

## Phase 1

- Authentication
- Dashboard
- Node Management
- Allocation Management

---

## Phase 2

- Installer
- Wings Management
- Monitoring

---

## Phase 3

- Alerting
- Backup Monitoring
- Audit Logs

---

## Phase 4

- Multi Panel Support
- Multi Region Support
- Billing Integration

---

END OF DOCUMENT