'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms and medical disclaimer to continue.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      router.push('/auth/login?registered=true');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string | Array<{msg: string}> } } };
      const detail = axiosError.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join('. '));
      } else {
        setError(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🔬 Diagnex</h1>
          <p>Create Your Account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="disclaimer-banner disclaimer-banner-danger">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Min 8 chars, 1 uppercase, 1 digit"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-ghost"
                style={{
                  position: 'absolute',
                  right: '0.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="form-hint">Minimum 8 characters with 1 uppercase letter and 1 digit</span>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              className="form-input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input
              id="reg-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ marginTop: '0.25rem', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="reg-terms" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              I understand that Diagnex provides screening estimates for research purposes
              only and does NOT replace professional medical advice, diagnosis, or treatment.
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span className="spinner" style={{ width: 18, height: 18 }} />
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/auth/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
