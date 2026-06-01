# Jacked

A mobile-first, zero-overhead private Progressive Web App (PWA) engineered to track body composition trends, automate workout progression, and manage nutritional intake. Built to operate seamlessly on mobile viewports without the maintenance friction of native App Stores.

---

## 🚀 Features

- **Lifting Engine:** Automates the StrongLifts 5x5 linear progression framework with real-time set tracking and progression charts.
- **Weight Ledger:** Track body composition trends with daily logs and 7-day moving averages.
- **Food & Macros:** Granular macro tracking with a "scratchpad" for quick entries, staples bank for frequent items, and target goal management.
- **Lifestyle Scorecard:** Monitor recovery variables including sleep quality, energy levels, coffee intake, and hydration.
- **Private & Secure:** Built on Supabase with Row Level Security (RLS) to ensure your data is yours alone.
- **Offline Ready:** PWA capabilities for a native-like experience on iOS and Android.

---

## 🛠 Tech Stack & Architecture

- **Frontend Framework:** React 19 (Vite) + TypeScript (Strict Mode)
- **Styling Engine:** Tailwind CSS v4 (Native Vite Compiler Toolchain)
- **Data Architecture & Cache Engine:** TanStack Query v5 (React Query)
- **Backend & Database Layer:** PostgreSQL via Supabase (RLS Enabled)
- **Data Visualization:** Recharts (Responsive SVG Configuration)
- **Iconography:** Lucide React

---

## 📂 Project Directory Structure

The repository uses a **Feature-Driven (Domain-Driven) Architecture**. All components, hooks, type definitions, and API clients belonging to a specific business unit reside inside a single, self-contained module directory.

```text
src/
├── components/          # Global presentation layout units
│   └── ProtectedRoute.tsx # Route barrier isolating unauthenticated sessions
├── context/             # Global system engines
│   └── AuthContext.tsx  # Supabase authentication connection container
├── features/            # Feature-bound domain directories
│   ├── auth/            # Sign-In layouts and validation routines
│   ├── food/            # Macro ledger, scratchpad, and staples bank
│   ├── lifestyle/       # Recovery scorecard and habit tracking
│   ├── lifting/         # StrongLifts 5x5 engine, sets dashboard, progression charts
│   └── weight/          # Weight entry handlers, 7-day trend calculations
├── hooks/               # Global shared utility hooks
├── lib/                 # Third-party instantiations
│   └── supabase.ts      # Strictly typed Supabase infrastructure interface
├── types/               # Generated types
│   └── supabase.ts      # Automated schema exports from Supabase CLI
├── App.tsx              # Application layout root & view-tab routing controller
├── main.tsx             # React DOM execution mount
└── index.css            # Tailwind v4 compiled layout styles
```

---

## 🛠 Development

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:
   Create a `.env` file with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Database Types

To update Supabase types run:

```bash
npx supabase gen types typescript --project-id "bocnauzbkqtomnjvcxlq" > src/types/supabase.ts
```
