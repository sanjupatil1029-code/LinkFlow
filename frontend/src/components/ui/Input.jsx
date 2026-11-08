import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(function Input({ label, icon: Icon, error, hint, type = 'text', className = '', ...props }, ref) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-blush">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blush/50" aria-hidden />}
        <input
          id={id}
          ref={ref}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`field ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-11' : ''} ${error ? 'border-rose focus:border-rose focus:ring-rose/20' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-blush/60 hover:bg-white/10 hover:text-white"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-[#f08a9d]">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-blush/50">{hint}</p>
      )}
    </div>
  );
});

export default Input;
