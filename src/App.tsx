import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dumbbell, LineChart, Apple, Zap } from 'lucide-react';
import {AuthScreen} from './features/auth/AuthScreen';
import { WeightModule } from './features/weight/WeightModule';

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
          <div className="flex h-screen flex-col bg-zinc-950 text-zinc-50 selection:bg-emerald-500/30">
            
            {/* View Container Area */}
            <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 max-w-md mx-auto w-full">
              {activeTab === 'dashboard' && <WeightModule />}
              {activeTab === 'lifting' && <div className="animate-fade-in">3-Tier Workout Tracker</div>}
              {activeTab === 'food' && <div className="animate-fade-in">Macro & Calorie Log</div>}
              {activeTab === 'analytics' && <div className="animate-fade-in">Recharts Visualizations</div>}
            </main>

            {/* Mobile Bottom Navigation Bar (PWA Form Factor) */}
            <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md pb-safe">
              <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-zinc-500'}`}
                >
                  <Zap className="h-5 w-5" />
                  <span>Log</span>
                </button>
                <button 
                  onClick={() => setActiveTab('lifting')}
                  className={`flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === 'lifting' ? 'text-emerald-400' : 'text-zinc-500'}`}
                >
                  <Dumbbell className="h-5 w-5" />
                  <span>Lift</span>
                </button>
                <button 
                  onClick={() => setActiveTab('food')}
                  className={`flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === 'food' ? 'text-emerald-400' : 'text-zinc-500'}`}
                >
                  <Apple className="h-5 w-5" />
                  <span>Food</span>
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === 'analytics' ? 'text-emerald-400' : 'text-zinc-500'}`}
                >
                  <LineChart className="h-5 w-5" />
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