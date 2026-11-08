import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for non-secure contexts
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('copy failed');
}

export default function CopyButton({ text, label = false, className = '' }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await copyText(text);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.');
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy short link"
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-2.5 text-sm font-medium text-white transition hover:bg-white/20 ${className}`}
    >
      {copied ? <Check className="h-4 w-4 text-amber" /> : <Copy className="h-4 w-4" />}
      {label && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  );
}
