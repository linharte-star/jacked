import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dumbbell, LineChart, Apple, Zap } from 'lucide-react';
import { AuthScreen } from './features/auth/AuthScreen';
import { WeightModule } from './features/weight/WeightModule';
import { LiftingModule } from './features/lifting/LiftingModule';
import { FoodModule } from './features/food/FoodModule';
import { AnalyticsModule } from './features/analytics/AnalyticsModule';
import styles from './App.module.css';

// Initialize the caching engine for production data syncing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes before silent background checking
    },
  },
});

type Tab = 'dashboard' | 'lifting' | 'food' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProtectedRoute fallback={<AuthScreen />}>
          {/* Main Mobile Shell Layout */}
          <div className={styles.shell}>
            {/* View Container Area */}
            <main className={styles.main}>
              {activeTab === 'dashboard' && (
                <WeightModule onNavigateToLift={() => setActiveTab('lifting')} />
              )}
              {activeTab === 'lifting' && <LiftingModule />}
              {activeTab === 'food' && <FoodModule />}
              {activeTab === 'analytics' && <AnalyticsModule />}
            </main>

            {/* Mobile Bottom Navigation Bar (PWA Form Factor) */}
            <nav className={`pb-safe ${styles.nav}`}>
              <div className={styles.navContainer}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.navButtonActive : styles.navButtonInactive}`}
                >
                  <Zap className={styles.navIcon} />
                  <span>Log</span>
                </button>
                <button
                  onClick={() => setActiveTab('lifting')}
                  className={`${styles.navButton} ${activeTab === 'lifting' ? styles.navButtonActive : styles.navButtonInactive}`}
                >
                  <Dumbbell className={styles.navIcon} />
                  <span>Lift</span>
                </button>
                <button
                  onClick={() => setActiveTab('food')}
                  className={`${styles.navButton} ${activeTab === 'food' ? styles.navButtonActive : styles.navButtonInactive}`}
                >
                  <Apple className={styles.navIcon} />
                  <span>Food</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`${styles.navButton} ${activeTab === 'analytics' ? styles.navButtonActive : styles.navButtonInactive}`}
                >
                  <LineChart className={styles.navIcon} />
                  <span>Charts</span>
                </button>
              </div>
            </nav>
          </div>
        </ProtectedRoute>
      </AuthProvider>
    </QueryClientProvider>
  );
}
