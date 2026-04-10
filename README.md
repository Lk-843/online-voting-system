# 🗳️ VoteSecure – Online Voting System

A full-stack secure online voting system built with Node.js, Express, MySQL, and vanilla JavaScript.

---

## 📁 Folder Structure

```
online-voting-system/
├── server/
│   ├── server.js              # Express entry point
│   ├── db.js                  # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   └── routes/
│       ├── auth.js            # Register & Login
│       ├── elections.js       # Election CRUD
│       ├── candidates.js      # Candidate management
│       └── votes.js           # Vote casting & results
├── public/
│   ├── index.html             # Login / Register page
│   ├── dashboard.html         # Voter dashboard
│   ├── admin.html             # Admin panel
│   ├── results.html           # Results with charts
│   ├── css/
│   │   └── style.css          # Global styles
│   └── js/
│       └── api.js             # Shared API utility
├── schema.sql                 # Database schema
├── .env                       # Environment variables
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.0+

---

### Step 1 – Clone / Download the project

```bash
cd online-voting-system
```

### Step 2 – Install dependencies

```bash
npm install
```

### Step 3 – Configure the database

1. Open MySQL Workbench or your MySQL client
2. Run the schema file:

```sql
SOURCE schema.sql;
-- or copy-paste the contents of schema.sql into your MySQL client
```

### Step 4 – Configure environment variables

Edit `.env` and update your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=voting_system
JWT_SECRET=change_this_to_a_random_string
```

### Step 5 – Start the server

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

### Step 6 – Open in browser

```
http://localhost:3000
```

---

## 👤 Creating an Admin Account

Register a normal account via the UI, then manually update the role in MySQL:

```sql
USE voting_system;
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Then log in — you'll be redirected to the Admin Panel automatically.

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs (10 salt rounds) |
| Authentication | JWT tokens (24h expiry) |
| Duplicate vote prevention | MySQL UNIQUE constraint on (user_id, election_id) |
| Admin protection | Role-based middleware on all admin routes |
| Input validation | Server-side validation on all endpoints |

---

## 📊 Database Schema

```sql
users        → id, name, email, password (hashed), role, created_at
elections    → id, title, description, start_date, end_date, status, created_by
candidates   → id, election_id, name, party, bio
votes        → id, user_id, election_id, candidate_id, voted_at
              UNIQUE(user_id, election_id)  ← prevents duplicate votes
```

---

## 🎨 Color Palette

| Token | Color | Hex |
|---|---|---|
| Primary | Deep Blue | `#1E3A8A` |
| Secondary | Blue | `#3B82F6` |
| Accent | Amber/Gold | `#F59E0B` |
| Background | Light Gray | `#F9FAFB` |
| Text | Dark Gray | `#111827` |

---

## 🚀 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/elections` | User | List all elections |
| GET | `/api/elections/:id` | User | Get election + candidates |
| POST | `/api/elections` | Admin | Create election |
| PUT | `/api/elections/:id` | Admin | Update election |
| DELETE | `/api/elections/:id` | Admin | Delete election |
| POST | `/api/candidates` | Admin | Add candidate |
| DELETE | `/api/candidates/:id` | Admin | Remove candidate |
| POST | `/api/votes` | User | Cast a vote |
| GET | `/api/votes/results/:id` | User | Get results |
