import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Stats() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E07A5F]/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#E07A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#3D405B] mb-2">Sign in required</h2>
        <p className="text-[#6B7280] mb-6">Please sign in to view your stats.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#E07A5F] px-6 py-3 font-medium text-white transition-all hover:bg-[#d36b52]"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#E07A5F] flex items-center justify-center shadow-lg shadow-[#E07A5F]/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#3D405B]">Stats</h1>
          <p className="text-[#6B7280] text-sm">Track your content performance</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#81B29A]/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#81B29A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#3D405B] mb-3">Coming Soon</h2>
        <p className="text-[#6B7280] max-w-md mx-auto mb-8">
          We're working on bringing you detailed analytics about your stories, including views, reads,
          engagement metrics, and audience insights.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#E07A5F]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#E07A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#3D405B]">Views</p>
            <p className="text-xs text-[#6B7280]">Track who's reading</p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#81B29A]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#81B29A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#3D405B]">Engagement</p>
            <p className="text-xs text-[#6B7280]">Likes & comments</p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#E07A5F]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#E07A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#3D405B]">Audience</p>
            <p className="text-xs text-[#6B7280]">Follower growth</p>
          </div>
        </div>
      </div>
    </div>
  );
}
