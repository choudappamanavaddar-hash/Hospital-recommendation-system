# Hospital Recommendation and Patient Management System

A production-ready, responsive, full-stack web application powered by **Supabase as the complete backend** with **React + TypeScript + Tailwind CSS** frontend.

Designed to help patients identify suitable hospital departments and doctors based on healthcare requirements, submit patient intake forms online, book appointments, track waiting queues in real time, and enable doctors and administrators to manage patient care efficiently.

---

## 🌟 Key Features & Supabase Backend Architecture

### 1. Supabase as Complete Backend
- **Supabase Auth**: User registration and role-based login (`PATIENT`, `DOCTOR`, `ADMIN`).
- **Supabase Database (PostgreSQL)**: Complete relational schema with tables for profiles, departments, doctors, schedules, patient requirements, recommendations, appointments, live queue entries, consultations, prescriptions, and pharmacy stock inventory.
- **Supabase Realtime**: Live listening to appointment status and queue progressions (`public:queue_entries`, `public:appointments`, `public:medicine_stock`).
- **Row-Level Security (RLS)**: Policies enabled on all tables for secure data access.
- **Automatic User Profile Trigger**: Seamless creation of `profiles` table entries upon Supabase Auth sign-up.

### 2. Modern Design System & CSS
- **Tailwind CSS + PostCSS Engine**: Full CSS pipeline with utility classes, typography, and responsive layouts.
- **Modern Medical Aesthetics**: Dark slate theme, teal/cyan glowing accents, glassmorphic panels, and Google Fonts (`Inter` + `Plus Jakarta Sans`).
- **Realtime Supabase Status Pill**: Live connection indicator in the navigation bar.

### 3. Patient & Hospital Features
- **AI / Rule-based Triage & Recommendation Engine**: Evaluates chief symptoms and clinical keywords, calculates match percentage scores, and pairs patients with relevant departments and doctors.
- **Patient Intake & Booking**: Multi-step requirement submission and appointment booking with reference code generation (`APP-XXXXXX`).
- **Live Queue Tracking**: Check-in online and track queue position, patients ahead, and estimated wait times dynamically.
- **Doctor Consultation Console**: Review medical intake, manage queue, call next patient, record diagnoses, and issue digital prescriptions.
- **Pharmacy Medicine Stock Page**: Track real-time drug inventory, monitor low-stock alerts, update quantities, and add new pharmaceuticals.
- **Admin Console**: Monitor hospital metrics, manage doctors, and view system statistics.

---

## 🚀 Getting Started

### 1. Setup Supabase Database
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project (or use your existing project).
3. Navigate to **SQL Editor** -> **New query**.
4. Open [supabase_schema.sql](file:///c:/Users/Smart/Desktop/hospital/supabase_schema.sql) in this repository, copy its content, and click **Run**.
   - This creates all tables, triggers, RLS policies, realtime replication, and seeds sample departments, doctors, and medicines!

### 2. Configure Environment Variables
In `frontend/.env` (and root `.env.example`):
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
*(You can find your Project URL and Anon Public Key in Supabase Dashboard -> Project Settings -> API)*

### 3. Run the Application
```bash
# Install dependencies (if not already done)
npm install

# Start Vite Frontend (powered directly by Supabase backend)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📁 Repository Structure

```
hospital-management-system/
├── supabase_schema.sql           # Complete Supabase SQL migration & seed script
├── frontend/                     # React + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/           # Navbar, Footer, Cards, Modals, Inputs, DataTables
│   │   ├── pages/                # Home, Auth, Intake, Booking, Doctors, Stock, Dashboards
│   │   ├── services/
│   │   │   ├── supabase.ts       # Supabase Client & Complete Backend Services
│   │   │   └── api.ts            # Supabase API Adapter & Persistence Bridge
│   │   ├── types/                # TypeScript Interfaces & Models
│   │   ├── App.tsx               # Application Routes
│   │   ├── index.css             # Tailwind Design System & Styling
│   │   └── main.tsx              # React Entry Point
│   ├── postcss.config.js         # PostCSS Tailwind Configuration
│   ├── tailwind.config.js        # Tailwind Theme and Extensions
│   ├── .env                      # Supabase Environment Variables
│   └── package.json
├── backend/                      # Legacy Express Backend
└── package.json                  # Workspace Scripts
```
