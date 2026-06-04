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
import { AppTab } from './types/types';

// Initialize the caching engine for production data syncing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes before silent background checking
    },
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProtectedRoute fallback={<AuthScreen />}>
          {/* Main Mobile Shell Layout */}
          <div className={styles.shell}>
            {/* View Container Area - Keep-Alive Pattern to preserve module state */}
            <main className={styles.main}>
              <div className={activeTab === AppTab.DASHBOARD ? 'contents' : 'hidden'}>
                <WeightModule onNavigateToLift={() => setActiveTab(AppTab.LIFTING)} />
              </div>
              <div className={activeTab === AppTab.LIFTING ? 'contents' : 'hidden'}>
                <LiftingModule />
              </div>
              <div className={activeTab === AppTab.FOOD ? 'contents' : 'hidden'}>
                <FoodModule />
              </div>
              <div className={activeTab === AppTab.ANALYTICS ? 'contents' : 'hidden'}>
                <AnalyticsModule />
              </div>
            </main>

            {/* Mobile Bottom Navigation Bar (PWA Form Factor) */}
            <nav className={`pb-safe ${styles.nav}`}>
              <div className={styles.navContainer}>
                <button
                  onClick={() => setActiveTab(AppTab.DASHBOARD)}
                  className={`${styles.navButton} ${activeTab === AppTab.DASHBOARD ? styles.navButtonActive : styles.navButtonInactive}`}
                >
                  <Zap className={styles.navIcon} />
                  <span>Log</span>
                </button>
                <button
                  onClick={() => setActiveTab(AppTab.LIFTING)}
                  className={`${styles.navButton} ${activeTab === AppTab.LIFTING ? styles.navButtonActive : styles.navButtonInactive}`}
                >
                  <Dumbbell className={styles.navIcon} />
                  <span>Lift</span>
                </button>
                <button
                  onClick={() => setActiveTab(AppTab.FOOD)}
                  className={`${styles.navButton} ${activeTab === AppTab.FOOD ? styles.navButtonActive : styles.navButtonInactive}`}
                >
                  <Apple className={styles.navIcon} />
                  <span>Food</span>
                </button>
                <button
                  onClick={() => setActiveTab(AppTab.ANALYTICS)}
                  className={`${styles.navButton} ${activeTab === AppTab.ANALYTICS ? styles.navButtonActive : styles.navButtonInactive}`}
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
