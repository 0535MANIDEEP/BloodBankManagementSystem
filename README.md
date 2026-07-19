# 🩸 BloodGrid — Blood Bank Management System

A full-stack, production-ready Blood Bank Management System built with **React + Vite + TypeScript** on the frontend and **Node.js + Express + MongoDB** on the backend.

---

## 🏗️ Architecture

```
blood-bank-system/
├── client/                  # React + Vite + TypeScript + TailwindCSS frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Auth, Donor, Hospital, Admin pages
│       ├── store/           # Zustand state management
│       ├── services/        # Axios API client
│       ├── layouts/         # Dashboard layout with sidebar
│       └── router/          # Role-based protected routes
├── server/                  # Node.js + Express + MongoDB backend
│   ├── config/              # Database connection
│   ├── controllers/         # Business logic handlers
│   ├── middleware/          # JWT auth, error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   └── services/            # Upload service (Mock S3 / real S3)
├── docker-compose.yml        # MongoDB Docker container (optional fallback)
└── package.json             # Monorepo workspace config
```

---

## ✅ Features

### Authentication & Roles
- JWT-based authentication with 30-day token expiry
- Three roles: **Admin**, **Donor**, **Hospital**
- Role-based route guards on both frontend and backend

### Donor Portal
- AI-powered eligibility checker (age, weight, health conditions, 90-day interval rule)
- Donation history log
- ID proof document upload (Mock S3 / local)
- Profile completion progress meter
- Account management & deletion

### Hospital Portal
- Submit blood requests (Normal / Emergency priority)
- Real-time inventory availability check before submission
- Track request lifecycle: **Pending → Approved → Completed**
- Emergency request fast-track button

### Admin Dashboard
- Live inventory chart (animated SVG bar chart)
- AI Smart Alerts: low stock warnings, expiry notifications
- Inventory CRUD with auto-expiry cleanup (FIFO allocation)
- Hospital request approval with unit allocation (bag-splitting logic)
- Donor directory management with ban/unban controls

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or use Docker)

### Option A — Local MongoDB

Make sure MongoDB is running, then:

```powershell
# Clone and install all dependencies
git clone https://github.com/your-username/blood-bank-system
cd blood-bank-system
npm install --legacy-peer-deps

# Start both server + client simultaneously
npm run dev
```

### Option B — Docker MongoDB

```powershell
# Start MongoDB via Docker
docker-compose up -d

# Install dependencies
npm install --legacy-peer-deps

# Start both server + client
npm run dev
```

### Individual Startup

```powershell
npm run dev:server    # Express server on http://localhost:5000
npm run dev:client    # Vite frontend on http://localhost:5173
```

---

## 🔐 Default Admin Credentials

The system auto-seeds a default admin account on first startup:

| Field    | Value                    |
|----------|--------------------------|
| Email    | `admin@bloodbank.com`    |
| Password | `adminpassword123`       |
| Role     | Admin                    |

---

## 🌐 API Reference

| Method | Endpoint                   | Access         | Description                        |
|--------|---------------------------|----------------|------------------------------------|
| POST   | `/api/auth/register`       | Public         | Register donor or hospital         |
| POST   | `/api/auth/login`          | Public         | Login and receive JWT              |
| GET    | `/api/auth/me`             | Protected      | Get current user profile           |
| GET    | `/api/donor`               | Admin / Donor  | List donors or own history         |
| POST   | `/api/donor`               | Donor          | Submit donation record             |
| PUT    | `/api/donor/:id`           | Admin / Donor  | Update donor profile               |
| GET    | `/api/donor/eligibility`   | Donor          | AI eligibility check               |
| GET    | `/api/inventory`           | All            | Get stock levels & AI alerts       |
| POST   | `/api/inventory`           | Admin          | Add blood bag                      |
| PUT    | `/api/inventory/:id`       | Admin          | Update inventory item              |
| DELETE | `/api/inventory/:id`       | Admin          | Remove blood bag                   |
| POST   | `/api/inventory/clean-expired` | Admin     | Auto-remove expired bags           |
| POST   | `/api/request`             | Hospital       | Submit blood request               |
| GET    | `/api/request`             | Admin / Hospital| Get requests                      |
| PUT    | `/api/request/:id/approve` | Admin          | Approve & allocate units           |
| PUT    | `/api/request/:id/reject`  | Admin          | Reject with message                |
| PUT    | `/api/request/:id/complete`| Admin          | Mark delivery as complete          |
| POST   | `/api/upload`              | Protected      | Upload ID proof (Mock S3 / S3)     |

---

## ⚙️ Environment Configuration

Copy `.env.example` to `server/.env` and adjust as needed:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bloodbank
JWT_SECRET=supersecretjwtkeyforbloodbank2026
USE_MOCK_S3=true            # Set to false to use real AWS S3

# AWS S3 (only needed when USE_MOCK_S3=false)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=
```

---

## 🎨 Tech Stack

| Layer        | Technology                            |
|-------------|---------------------------------------|
| Frontend    | React 19, Vite 8, TypeScript          |
| Styling     | TailwindCSS 3, Framer Motion          |
| Icons       | Lucide React                          |
| State Mgmt  | Zustand                               |
| HTTP Client | Axios                                 |
| Routing     | React Router v6                       |
| Backend     | Node.js, Express                      |
| Database    | MongoDB + Mongoose                    |
| Auth        | JWT + bcryptjs                        |
| Uploads     | Multer (Mock S3 / AWS S3)             |
| DevOps      | Docker Compose, npm workspaces        |

---

## 📁 Folder Structure — Frontend Pages

```
src/pages/
├── auth/
│   ├── Login.tsx           Unified login for all roles
│   └── Register.tsx        Tabbed Donor / Hospital registration
├── donor/
│   ├── DonorDashboard.tsx  AI eligibility + donation history
│   ├── DonateForm.tsx      Submit donation + upload ID proof
│   └── DonorProfile.tsx    Edit health profile + delete account
├── hospital/
│   ├── HospitalDashboard.tsx  Status overview + stock preview
│   ├── RequestBlood.tsx       Submit blood request (Normal/Emergency)
│   └── TrackRequests.tsx      Real-time request status tracking
└── admin/
    ├── AdminDashboard.tsx     Inventory chart + AI alerts + requests
    ├── ManageInventory.tsx    Add/update/clean blood bags
    ├── ManageRequests.tsx     Approve/reject/dispatch requests
    └── ManageDonors.tsx       Donor directory + ban controls
```

---

## 🧠 AI Features

- **Donor Eligibility Engine**: Rule-based AI that checks age (18–65), weight (≥50kg), health conditions, and 90-day donation interval — provides human-readable suggestions with exact return dates.
- **Smart Inventory Alerts**: Detects blood groups with 0 or <8 units and generates critical alerts on the admin dashboard.
- **Expiry Warning System**: Flags bags expiring within 7 days for priority dispatch.
- **FIFO Allocation**: Oldest blood bags are allocated first to minimize waste. Partial bag-splitting is supported.

---

*Built with ❤️ and 🩸 — BloodGrid 2026*
