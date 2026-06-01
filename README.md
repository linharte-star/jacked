# FitTrack Private

A mobile-first, zero-overhead private Progressive Web App (PWA) engineered to track body composition trends and completely automate the StrongLifts 5x5 linear progression framework. Built to operate seamlessly on mobile viewports without the maintenance friction of native App Stores.

---

## 🛠 Tech Stack & Architecture

* **Frontend Framework:** React 19 (Vite) + TypeScript (Strict Mode)
* **Styling Engine:** Tailwind CSS v4 (Native Vite Compiler Toolchain)
* **Data Architecture & Cache Engine:** TanStack Query v5 (React Query)
* **Backend & Database Layer:** PostgreSQL via Supabase (Row Level Security Enabled)
* **Data Visualization:** Recharts (Responsive SVG Configuration)
* **Iconography:** Lucide React

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



To update Supabase types run:
"npx supabase gen types typescript --project-id "bocnauzbkqtomnjvcxlq" > src/types/supabase.ts"