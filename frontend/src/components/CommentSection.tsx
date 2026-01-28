import { useState, useEffect } from 'react';
import { commentAPI } from '../services/api';
import type { Comment } from '../types/comment';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await commentAPI.getPostComments(postId);
      setComments(res.comments || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (content: string) => {
    try {
      const res = await commentAPI.createComment(postId, content);
      setComments((prev) => [res.comment, ...prev]);
    } catch (err: any) {
      console.error('Failed to create comment:', err);
      throw err;
    }
  };

  const handleReply = async (content: string, parentId: number) => {
    try {
      const res = await commentAPI.createComment(postId, content, parentId);
      // Add reply to the parent comment
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), res.comment],
            };
          }
          // Check nested replies
          if (comment.replies) {
            return {
              ...comment,
              replies: addReplyToNested(comment.replies, parentId, res.comment),
            };
          }
          return comment;
        })
      );
    } catch (err: any) {
      console.error('Failed to reply:', err);
      throw err;
    }
  };

  const addReplyToNested = (
    replies: Comment[],
    parentId: number,
    newReply: Comment
  ): Comment[] => {
    return replies.map((reply) => {
      if (reply.id === parentId) {
        return {
          ...reply,
          replies: [...(reply.replies || []), newReply],
        };
      }
      if (reply.replies) {
        return {
          ...reply,
          replies: addReplyToNested(reply.replies, parentId, newReply),
        };
      }
      return reply;
    });
  };

  const handleEdit = async (commentId: number, content: string) => {
    try {
      await commentAPI.updateComment(commentId, content);
      setComments((prev) => updateCommentInTree(prev, commentId, content));
    } catch (err: any) {
      console.error('Failed to edit comment:', err);
      throw err;
    }
  };

  const updateCommentInTree = (
    comments: Comment[],
    commentId: number,
    content: string
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, content, updated_at: new Date().toISOString() };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, content),
        };
      }
      return comment;
    });
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentAPI.deleteComment(commentId);
      setComments((prev) => deleteCommentFromTree(prev, commentId));
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      throw err;
    }
  };

  const deleteCommentFromTree = (comments: Comment[], commentId: number): Comment[] => {
    return comments
      .filter((comment) => comment.id !== commentId)
      .map((comment) => {
        if (comment.replies) {
          return {
            ...comment,
            replies: deleteCommentFromTree(comment.replies, commentId),
          };
        }
        return comment;
      });
  };

  const totalComments = comments.reduce((acc, comment) => {
    const countReplies = (replies: Comment[] = []): number =>
      replies.length + replies.reduce((sum, r) => sum + countReplies(r.replies), 0);
    return acc + 1 + countReplies(comment.replies);
  }, 0);

  return (
    <div className="mt-12 pt-8 border-t border-[#E8E2D9]">
      <h2 className="text-xl font-bold text-[#3D405B] mb-6">
        Comments {totalComments > 0 && `(${totalComments})`}
      </h2>

      <div className="mb-8">
        <CommentForm onSubmit={handleCreateComment} />
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-[#E8E2D9] rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-[#E8E2D9] rounded mb-2" />
                <div className="h-16 bg-[#E8E2D9] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchComments}
            className="text-sm text-[#E07A5F] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && comments.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[#6B7280]">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}

      {!loading && !error && comments.length > 0 && (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
