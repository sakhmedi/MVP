import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PostEditor from '../components/PostEditor'
import { postAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#E07A5F]/20 to-[#81B29A]/20 border border-[#E8E2D9] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#E07A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#3D405B] mb-2">Sign in required</h2>
          <p className="text-[#6B7280] mb-6">Please log in to create a post.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#E07A5F] px-6 py-3 font-medium text-white transition-all hover:bg-[#d36b52] hover:shadow-lg hover:shadow-[#E07A5F]/30"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  const submitPost = async (published: boolean) => {
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setIsSubmitting(true)
    setIsPublished(published)

    try {
      const postData = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        tags: tags.trim() || undefined,
        cover_image: coverImage.trim() || undefined,
        published,
      }

      const response = await postAPI.createPost(postData)
      navigate(`/posts/${response.post.slug}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitPost(isPublished)
  }

  const handleSaveDraft = () => {
    submitPost(false)
  }

  const handlePublish = () => {
    submitPost(true)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E07A5F] flex items-center justify-center shadow-lg shadow-[#E07A5F]/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#3D405B]">Create New Post</h1>
              <p className="text-[#6B7280] text-sm">Share your thoughts with the world</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 md:p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl md:text-4xl font-bold bg-transparent border-none focus:outline-none text-[#3D405B] placeholder-[#9CA3AF]"
                disabled={isSubmitting}
              />
            </div>

            {/* Cover Image URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#3D405B] mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#E8E2D9] rounded-xl text-[#3D405B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#3D405B] mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="javascript, react, tutorial"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#E8E2D9] rounded-xl text-[#3D405B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
              <p className="mt-1.5 text-xs text-[#6B7280]">Separate tags with commas</p>
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#3D405B] mb-2">
                Excerpt
              </label>
              <textarea
                placeholder="A brief summary of your post..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#E8E2D9] rounded-xl text-[#3D405B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent transition-all resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Content Editor */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Content</label>
              <PostEditor content={content} onChange={setContent} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-[#E8E2D9] rounded-xl text-[#6B7280] hover:bg-[#F5F0E8] hover:text-[#3D405B] transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2.5 border border-[#81B29A] rounded-xl text-[#81B29A] hover:bg-[#81B29A]/10 transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-6 py-2.5 bg-[#E07A5F] text-white rounded-xl hover:bg-[#d36b52] hover:shadow-lg hover:shadow-[#E07A5F]/30 transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Publishing...
                  </span>
                ) : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
