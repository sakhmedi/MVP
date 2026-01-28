import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types/comment';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentId: number) => Promise<void>;
  onEdit: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export default function CommentItem({ comment, onReply, onEdit, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?.id === comment.user_id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setShowReplyForm(false);
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      await onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        <Link to={`/user/${comment.user?.username}`} className="flex-shrink-0">
          {comment.user?.avatar ? (
            <img
              src={comment.user.avatar}
              alt={comment.user.full_name || comment.user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#E07A5F] flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {(comment.user?.full_name || comment.user?.username || 'A')[0].toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/user/${comment.user?.username}`}
              className="font-medium text-[#3D405B] hover:text-[#E07A5F] transition-colors"
            >
              {comment.user?.full_name || comment.user?.username}
            </Link>
            <span className="text-sm text-[#9CA3AF]">{formatDate(comment.created_at)}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-[#9CA3AF]">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#3D405B] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 focus:border-[#E07A5F] resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#3D405B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editContent.trim()}
                  className="px-5 py-2 rounded-full bg-[#E07A5F] text-sm font-medium text-white transition-all hover:bg-[#d36b52] disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[#4B5563] whitespace-pre-wrap">{comment.content}</p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm text-[#6B7280] hover:text-[#E07A5F] transition-colors"
              >
                Reply
              </button>

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-sm text-[#6B7280] hover:text-[#3D405B] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-[#E8E2D9] py-1 z-20">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-[#3D405B] hover:bg-[#FAF7F2] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                onSubmit={handleReply}
                placeholder={`Reply to ${comment.user?.full_name || comment.user?.username}...`}
                buttonText="Reply"
                autoFocus
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-[#E8E2D9]">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
