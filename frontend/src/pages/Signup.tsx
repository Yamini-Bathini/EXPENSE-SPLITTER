import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../lib/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.user) {
      navigate('/', { replace: true });
    }
  }, [auth.user, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    try {
      await auth.signup(username, email, password, phone);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        const axiosError = err as unknown as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message ?? err.message);
      } else {
        setError('Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-10 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md rounded-[32px] border border-white/60 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 p-10 shadow-xl backdrop-blur-xl shadow-rose-100/50">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-500">New account</p>
          <h1 className="text-3xl font-semibold">Create your profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Sign up with your name, email, and password to access the dashboard.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="username">
              Username
            </label>
            <Input
              autoComplete="username"
              disabled={loading}
              id="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="alice"
              required
              type="text"
              value={username}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
              Email address
            </label>
            <Input
              autoComplete="email"
              disabled={loading}
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="phone">
              Phone number (optional)
            </label>
            <Input
              autoComplete="tel"
              disabled={loading}
              id="phone"
              name="phone"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+1 555 123 4567"
              type="tel"
              value={phone}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <Input
              autoComplete="new-password"
              disabled={loading}
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Choose a password"
              required
              type="password"
              value={password}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              autoComplete="new-password"
              disabled={loading}
              id="confirmPassword"
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              required
              type="password"
              value={confirmPassword}
            />
          </div>
          {error ? <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">{error}</div> : null}
          <Button disabled={loading || !username || !email || !password || !confirmPassword} className="w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link className="font-semibold text-sky-600 hover:text-sky-700" to="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
