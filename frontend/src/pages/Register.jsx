import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/format';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
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
    if (!form.username.trim()) er.username = 'Choose a username';
    if (!form.email.trim()) er.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = 'Enter a valid email address';
    if (!form.password) er.password = 'Password is required';
    else if (form.password.length < 8) er.password = 'Use at least 8 characters';
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Account created. Welcome to LinkFlow!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start shortening and tracking links in seconds."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input
          label="Username"
          icon={User}
          autoComplete="username"
          placeholder="yourname"
          value={form.username}
          onChange={set('username')}
          error={errors.username}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />

        {formError && (
          <div role="alert" className="rounded-xl border border-rose/40 bg-rose/15 px-3.5 py-2.5 text-sm text-[#f6b4bf]">
            {formError}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
