# 🎨 LeadFlow for Designers

> **Stop chasing clients. Buy verified design leads instantly.**

A full-stack, production-ready lead generation marketplace for designers — featuring AI intent scoring, real-time notifications via Socket.io, a credit-based purchase system, and a verified lead pipeline.

---

## 📁 Project Structure

```
leadflow/
├── frontend/                    # Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx             # Landing page (SEO optimized)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── client/page.tsx      # Client lead submission form
│   │   ├── designer/
│   │   │   ├── dashboard/page.tsx   # Live leads feed
│   │   │   ├── leads/page.tsx       # Purchased leads
│   │   │   ├── analytics/page.tsx   # ROI & performance
│   │   │   ├── profile/page.tsx
│   │   │   └── transactions/page.tsx
│   │   └── admin/
│   │       ├── dashboard/page.tsx   # Admin overview
│   │       └── leads/page.tsx       # Lead management
│   ├── components/
│   │   ├── ui/                  # StatCard, Badge, Toast
│   │   ├── leads/LeadCard.tsx   # Lead card with lock/buy
│   │   └── designer/DesignerSidebar.tsx
│   ├── hooks/useSocket.ts       # Socket.io real-time hook
│   ├── lib/
│   │   ├── api.ts               # Axios client
│   │   └── store.ts             # Zustand auth store
│   └── tailwind.config.js
│
└── backend/                     # Node.js + Express
    └── src/
        ├── server.js            # Main entry point
        ├── config/
        │   ├── database.js      # MongoDB connection
        │   └── socket.js        # Socket.io setup + emit helpers
        ├── models/
        │   ├── User.js
        │   ├── Lead.js
        │   └── Transaction.js
        ├── controllers/
        │   ├── authController.js
        │   ├── leadController.js
        │   ├── paymentController.js
        │   └── adminController.js
        ├── services/
        │   ├── aiService.js         # OpenAI + mock fallback
        │   ├── leadLockService.js   # Auto-unlock cron
        │   └── duplicateService.js
        ├── middleware/
        │   └── auth.js          # JWT protect + restrictTo
        ├── routes/
        │   ├── auth.js
        │   ├── leads.js
        │   ├── payments.js
        │   ├── users.js
        │   ├── admin.js
        │   └── upload.js
        └── seed.js              # Demo data seeder
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- (Optional) OpenAI API key
- (Optional) Cloudinary account (for video uploads)

---

### 1. Clone & Install

```bash
git clone https://github.com/yourname/leadflow.git
cd leadflow

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### 2. Configure Environment Variables

**Backend** — copy and fill in your values:
```bash
cd backend
cp .env.example .env
```

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/leadflow

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Optional — AI scoring (falls back to keyword heuristics if not set)
OPENAI_API_KEY=sk-your-openai-key

# Optional — Video uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments (mock in dev)
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

LEAD_LOCK_DURATION_MINUTES=2
MIN_INTENT_SCORE=0.5
```

**Frontend** — create `.env.local`:
```bash
cd frontend
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key
```

---

### 3. Seed Demo Data

```bash
cd backend
node src/seed.js
```

This creates:
- **Admin:** admin@demo.com / admin123
- **Designer:** designer@demo.com / demo123
- **Client:** client@demo.com / demo123
- 7 sample leads, transactions, and credit history

---

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# API running at http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App running at http://localhost:3000
```

---

## 📡 API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user (3 free credits for designers) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user |

### Leads
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/leads` | Designer | Get all open/locked leads (preview only) |
| POST | `/api/leads/create` | Client | Submit new lead (triggers AI analysis) |
| POST | `/api/leads/lock` | Designer | Lock lead for 2 minutes |
| POST | `/api/leads/unlock` | Designer | Manually unlock |
| POST | `/api/leads/purchase` | Designer | Buy lead — deducts credits, reveals contact |
| GET | `/api/leads/:id` | Bearer | Get lead (full details only if purchased) |

### Payments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/payments/packs` | Public | Get available credit packs |
| POST | `/api/payments/create-order` | Designer | Create Razorpay order |
| POST | `/api/payments/verify` | Designer | Verify payment + credit account |
| POST | `/api/payments/refund` | Admin | Refund credits for invalid lead |

### Users
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/users/credits` | Bearer | Get current credit balance |
| GET | `/api/users/transactions` | Bearer | Get transaction history |
| GET | `/api/users/purchased-leads` | Designer | Get all purchased leads with contact info |
| PATCH | `/api/users/profile` | Bearer | Update profile & preferences |

### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Platform stats + pending leads |
| GET | `/api/admin/leads` | Admin | All leads with filters |
| PATCH | `/api/admin/leads/:id/verify` | Admin | Approve lead (triggers Socket.io broadcast) |
| PATCH | `/api/admin/leads/:id/reject` | Admin | Reject lead |
| GET | `/api/admin/users` | Admin | All users |
| PATCH | `/api/admin/users/:id/toggle-active` | Admin | Activate/deactivate user |

---

## ⚡ Real-Time Events (Socket.io)

Designers connect with their JWT token. Events emitted:

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `lead:new` | Server → Designers | `{id, service, budget, location, tags, intentScore}` | New verified lead available |
| `lead:locked` | Server → Designers | `{leadId, lockExpiry}` | Lead locked by another designer |
| `lead:unlocked` | Server → Designers | `{leadId}` | Lead auto-unlocked (lock expired) |
| `lead:sold` | Server → Designers | `{leadId}` | Lead purchased — remove from feed |
| `credits:added` | Server → User | `{credits, total}` | Credits added after payment |
| `credits:refunded` | Server → User | `{credits, leadId}` | Refund processed |
| `lead:purchased` | Server → User | `{leadId, creditsLeft}` | Purchase confirmation |

---

## 🤖 AI Lead Analysis

When a client submits a lead, the AI service:
1. Analyzes the description text
2. Extracts style/project tags (Modern, Luxury, 3BHK, Urgent, etc.)
3. Calculates an intent score (0–1) based on description quality, budget specificity, urgency signals
4. Returns results to the submission form for client confirmation

**With OpenAI API key:** Uses GPT-3.5-turbo for nuanced analysis.  
**Without API key (default):** Falls back to a keyword-based heuristic system — works great for MVP.

---

## 🔒 Lead Lock System

```
Designer clicks "Buy Lead"
        ↓
POST /api/leads/lock
        ↓
Lead status = "locked"
lockedBy = designerId
lockExpiry = now + 2 minutes
        ↓
Socket emits "lead:locked" to ALL designers
        ↓
        ┌─────────────────────────────────┐
        │                                 │
   Payment succeeds               Lock expires (cron)
        │                                 │
POST /api/leads/purchase        Lead status = "open"
Credits deducted                Socket emits "lead:unlocked"
Contact revealed
Socket emits "lead:sold"
```

The cron job runs every 30 seconds to auto-unlock expired leads.

---

## 💳 Credit System

| Pack | Credits | Bonus | Price |
|------|---------|-------|-------|
| Starter | 50 | 0 | ₹999 |
| Pro | 150 | +10 | ₹2,499 |
| Enterprise | 500 | +50 | ₹6,999 |

**Lead costs:**
- Budget ≥ ₹5L → 7 credits
- Budget ₹1L–₹5L → 5 credits
- Budget ₹25K–₹1L → 3 credits
- Budget < ₹25K → 2 credits

New designer signup → **3 free credits automatically.**

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd frontend
vercel deploy

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
# NEXT_PUBLIC_SOCKET_URL=https://your-api.onrender.com
```

### Backend → Render

1. Create new Web Service on Render
2. Connect your GitHub repo, set root to `/backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`

### MongoDB → Atlas

1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist `0.0.0.0/0` for Render IP
4. Copy connection string to `MONGODB_URI`

---

## 🔐 Security Features

- JWT authentication with 7-day expiry
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting: 200 req/15min global, 10 req/15min for auth routes
- Helmet.js security headers
- Input validation with express-validator
- Client phone/contact info never exposed in lead listing
- Role-based access control (client / designer / admin)
- CORS restricted to frontend origin

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State | Zustand (persisted auth) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| AI | OpenAI GPT-3.5 (+ mock fallback) |
| Storage | Cloudinary (video uploads) |
| Payments | Razorpay (mock in dev) |
| Deployment | Vercel (FE) + Render (BE) + MongoDB Atlas |

---

## 📄 License

MIT License — build on it, ship it, make money.

---

*Built with ❤️ for the Indian design community.*
#   l e a d f l o w  
 