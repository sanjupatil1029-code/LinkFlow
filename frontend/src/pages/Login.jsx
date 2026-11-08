import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/format';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setFormError('');
  };

  const validate = () => {
    const er = {};
    if (!form.email.trim()) er.email = 'Email is required';
    if (!form.password) er.password = 'Password is required';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      setFormError(
        status === 401 || status === 400 || status === 404
          ? getErrorMessage(err, 'Incorrect email or password.')
          : getErrorMessage(err, 'Could not sign you in.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your links and analytics."
      footer={
        <>
          New to LinkFlow?{' '}
          <Link to="/register" className="font-semibold text-amber hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
        />

        {formError && (
          <div role="alert" className="rounded-xl border border-rose/40 bg-rose/15 px-3.5 py-2.5 text-sm text-[#f6b4bf]">
            {formError}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}
