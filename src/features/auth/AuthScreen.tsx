import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { KeyRound, Mail, Dumbbell, AlertCircle } from 'lucide-react';
import styles from './AuthScreen.module.css';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedEmail = email.trim();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });
      if (error) setError(error.message);
      else alert('Check your email for the confirmation link!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Branding Head */}
        <div className={styles.branding}>
          <div className={styles.iconWrapper}>
            <Dumbbell className="h-6 w-6" />
          </div>
          <h1 className={styles.title}>Jacked Fit</h1>
          <p className={styles.description}>Log your performance, metrics, and lifestyle.</p>
        </div>

        {/* Dynamic Error State */}
        {error && (
          <div className={styles.errorContainer}>
            <AlertCircle className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form Submission Engine */}
        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <KeyRound className={styles.inputIcon} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Processing...' : isSignUp ? 'Create Private Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode Control */}
        <div className={styles.toggleWrapper}>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className={styles.toggleButton}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
