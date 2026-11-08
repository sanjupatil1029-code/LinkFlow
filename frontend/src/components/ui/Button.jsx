import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-gradient-to-br from-amber to-[#e58a6f] text-ink font-semibold shadow-glow hover:brightness-110 active:brightness-95',
  secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
  ghost: 'text-blush hover:bg-white/10 hover:text-white',
  danger: 'bg-rose/20 text-rose border border-rose/40 hover:bg-rose/30',
  light: 'bg-white text-ink font-semibold hover:bg-blush',
  outline: 'border border-white/25 text-white hover:bg-white/10',
};

const sizes = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, pill = false, disabled, to, className = '', children, ...props },
  ref
) {
  const cls = `inline-flex items-center justify-center ${pill ? 'rounded-full' : 'rounded-xl'} font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link ref={ref} to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button ref={ref} disabled={disabled || loading} className={cls} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export default Button;
