
# Dost Admin Panel v2.4

A production-ready hospitality management dashboard for the Dost ecosystem.

## 🚀 Key Features
- **Dashboard**: Real-time KPI tracking and revenue analytics using Recharts.
- **Room Management**: Full CRUD with multi-image upload simulation.
- **Booking Engine**: reservation approval/cancellation workflows.
- **User Management**: Client profile tracking and account blocking.
- **Financials**: Revenue breakdown, transaction history, and refund handling.
- **Settings**: Complete white-labeling and system configuration.

## 🛠️ Tech Stack
- **React 19** with TypeScript
- **Tailwind CSS** for responsive styling
- **TanStack Query** for reliable server state
- **Zustand** for lightweight global store
- **React Hook Form** for robust form handling
- **Vite** for optimized builds

## 📦 Setup & Deployment
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Run development server: `npm run dev`.
5. Build for production: `npm run build`.

## 🔐 Security
- Role-based protected routes.
- Simulated JWT-based authentication via Supabase.
- CSRF and XSS protection via React defaults.
- Environment variables for all sensitive keys.

## 📄 License
MIT License. Created by Dost Engineering.
