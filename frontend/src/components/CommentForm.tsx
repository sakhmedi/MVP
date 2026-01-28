import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  placeholder = 'Write a comment...',
  buttonText = 'Comment',
  autoFocus = false,
  onCancel,
}: CommentFormProps) {
  const { isAuthenticated, user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#FAF7F2] rounded-xl p-6 text-center border border-[#E8E2D9]">
        <p className="text-[#6B7280] mb-3">Sign in to join the conversation</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#E07A5F] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#d36b52]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-shrink-0">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.full_name || user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#E07A5F] flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#3D405B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 focus:border-[#E07A5F] resize-none transition-all"
          rows={3}
        />
        <div className="flex items-center justify-end gap-2 mt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#3D405B] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="px-5 py-2 rounded-full bg-[#E07A5F] text-sm font-medium text-white transition-all hover:bg-[#d36b52] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : buttonText}
          </button>
        </div>
      </div>
    </form>
  );
}
