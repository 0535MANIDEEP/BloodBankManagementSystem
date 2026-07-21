# BloodGrid — Blood Bank Management System

Full-stack blood bank management system with donor registration, inventory tracking, hospital request workflows, and role-based access control.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, TypeScript |
| Styling | Tailwind CSS 3, Framer Motion |
| State Management | Zustand |
| HTTP Client | Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| File Upload | Multer (Mock S3 / AWS S3) |
| DevOps | Docker Compose |

## Features

### Authentication
- JWT-based authentication with 30-day token expiry
- Three roles: Admin, Donor, Hospital
- Role-based route guards on frontend and backend

### Donor Portal
- AI-powered eligibility checker (age, weight, health conditions, 90-day interval)
- Donation history log
- ID proof document upload
- Profile management with account deletion

### Hospital Portal
- Blood request submission (Normal / Emergency priority)
- Real-time inventory availability check
- Request lifecycle tracking: Pending -> Approved -> Completed
- Emergency request fast-track

### Admin Dashboard
- Live inventory chart with animated SVG bar chart
- AI Smart Alerts: low stock warnings, expiry notifications
- Inventory CRUD with auto-expiry cleanup (FIFO allocation)
- Hospital request approval with unit allocation and bag-splitting logic
- Donor directory management with ban/unban controls

## Architecture

```
blood-bank-system/
├── client/                  # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Auth, Donor, Hospital, Admin pages
│       ├── store/           # Zustand state management
│       ├── services/        # Axios API client
│       ├── layouts/         # Dashboard layout with sidebar
│       └── router/          # Role-based protected routes
├── server/                  # Node.js + Express backend
│   ├── config/              # Database connection
│   ├── controllers/         # Business logic handlers
│   ├── middleware/          # JWT auth, error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   └── services/            # Upload, eligibility, inventory alert services
└── docker-compose.yml       # MongoDB container
```

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register donor or hospital |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Protected | Get current user profile |
| GET | `/api/donor` | Admin/Donor | List donors or own history |
| POST | `/api/donor` | Donor | Submit donation record |
| GET | `/api/donor/eligibility` | Donor | AI eligibility check |
| GET | `/api/inventory` | All | Get stock levels and alerts |
| POST | `/api/inventory` | Admin | Add blood bag |
| PUT | `/api/inventory/:id` | Admin | Update inventory item |
| DELETE | `/api/inventory/:id` | Admin | Remove blood bag |
| POST | `/api/inventory/clean-expired` | Admin | Auto-remove expired bags |
| POST | `/api/request` | Hospital | Submit blood request |
| GET | `/api/request` | Admin/Hospital | Get requests |
| PUT | `/api/request/:id/approve` | Admin | Approve and allocate units |
| PUT | `/api/request/:id/reject` | Admin | Reject with message |
| PUT | `/api/request/:id/complete` | Admin | Mark delivery complete |
| POST | `/api/upload` | Protected | Upload ID proof |

## Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally or via Docker

### Local Development

```bash
git clone https://github.com/your-username/blood-bank-system
cd blood-bank-system
npm install --legacy-peer-deps
npm run dev
```

### Docker Option

```bash
docker-compose up -d
npm install --legacy-peer-deps
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## Environment Variables

Copy `.env.example` to `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bloodbank
JWT_SECRET=your_jwt_secret
USE_MOCK_S3=true

# AWS S3 (only when USE_MOCK_S3=false)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=
```

## Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@bloodbank.com` |
| Password | `adminpassword123` |

## Deployed URL

[https://blood-bank-system.vercel.app](https://blood-bank-system.vercel.app)
