# Cygen Task - Full Stack Application

A modern full-stack application for order management with customers, products, and orders.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** 
- **PostgreSQL 13+**
- **npm** (or pnpm/yarn)

### 1. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE cygen_task;
```

### 2. Environment Configuration

Create `backend/.env`:
```env
DATABASE_URL="postgresql://<pg_user>:<pg_password>@localhost:5432/cygen_task?schema=public"
PORT=8000
ORIGIN=http://localhost:3000
```

Create `frontend/.env` (optional):
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Backend Setup & Start

```bash
# Install dependencies
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Setup database (choose one):
# Option A: Run migrations (recommended)
npx prisma migrate dev --name init

# Option B: Push schema (quick dev)
npm run db:push

# Seed demo data
npm run db:seed

# Start backend server
npm run dev
```

**Backend will run on:** http://localhost:8000/api

### 4. Frontend Setup & Start

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

**Frontend will run on:** http://localhost:3000

## 📁 Project Structure

```
cygen-task/
├── backend/          # Express API + Prisma + PostgreSQL
│   ├── src/         # TypeScript source code
│   ├── prisma/      # Database schema & migrations
│   └── tests/       # Jest test suites
└── frontend/        # React + Vite + Tailwind
    ├── src/         # React components & pages
    └── components/  # Reusable UI components
```

## 🛠️ Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with demo data
- `npm test` - Run test suite

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔗 API Endpoints

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| **Customers** | `GET/POST /api/customers`<br>`GET/PUT/DELETE /api/customers/:id` | Customer management |
| **Products** | `GET/POST /api/products`<br>`GET/PUT/DELETE /api/products/:id` | Product catalog |
| **Orders** | `GET/POST /api/orders`<br>`GET/PUT/DELETE /api/orders/:id` | Order management with nested items |

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
```

## 🏗️ Architecture

### Backend Stack
- **Express.js** - Web framework
- **Prisma** - Type-safe ORM with migrations
- **PostgreSQL** - Database
- **Zod** - Runtime validation
- **TypeScript** - Type safety

### Frontend Stack
- **React 19** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Key Features
- **Type Safety**: Full TypeScript coverage
- **Validation**: Zod schemas for API validation
- **Error Handling**: Centralized error middleware
- **Database**: Prisma with migrations
- **UI Components**: Custom shadcn-style components
- **Form Handling**: React Hook Form with validation

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Environment variable not found: DATABASE_URL` | Ensure `backend/.env` exists and database is running |
| Port conflicts | Change `PORT` in `backend/.env` or use `npm run dev -- --port 3001` |
| Database connection issues | Verify PostgreSQL is running and credentials are correct |
| Migration errors | Use `npm run db:push` for quick dev setup instead of migrations |

## 📝 Development Notes

- **Database**: Order model stores item-level prices to preserve history
- **Validation**: All API routes use Zod schemas with detailed error responses
- **CORS**: Configured via `ORIGIN` environment variable
- **Hot Reload**: Both frontend and backend support hot reloading in development
