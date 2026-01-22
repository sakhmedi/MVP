import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignupModal from './SignupModal';
import LoginModal from './LoginModal';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#24243a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Left side - Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#5b3d8a] to-[#7c5aad] flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-[#5b3d8a]/20">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Blog</span>
            </Link>

            {/* Center - Search (optional, shown on larger screens) */}
            {isAuthenticated && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search stories..."
                    className="w-full rounded-full bg-[#12121a] border border-[#24243a] pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5b3d8a] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Right side navigation */}
            <nav className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  {/* Navigation links */}
                  <Link
                    to="/feed"
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive('/feed')
                        ? 'bg-[#5b3d8a]/20 text-[#b99fe0]'
                        : 'text-gray-400 hover:text-white hover:bg-[#1a1a24]'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                    </svg>
                    Feed
                  </Link>

                  {/* Write button */}
                  <Link
                    to="/create-post"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#5b3d8a] to-[#7c5aad] text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-[#5b3d8a]/30"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="hidden sm:inline">Write</span>
                  </Link>

                  {/* Notifications */}
                  <button className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#1a1a24] transition-all">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {/* Notification badge */}
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#9d7dcf]"></span>
                  </button>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-[#1a1a24] transition-all"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#5b3d8a] to-[#9d7dcf] p-0.5">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#12121a] text-sm font-bold text-[#b99fe0]">
                          {user?.username?.[0].toUpperCase() || 'U'}
                        </div>
                      </div>
                      <svg className={`hidden sm:block h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showUserMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        {/* Menu */}
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#12121a] border border-[#24243a] shadow-xl shadow-black/50 py-2 z-50 animate-fade-in">
                          <div className="px-4 py-3 border-b border-[#24243a]">
                            <p className="text-sm font-semibold text-white">{user?.full_name || user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                          </div>
                          <div className="py-1">
                            <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a24] hover:text-white transition-colors">
                              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profile
                            </a>
                            <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a24] hover:text-white transition-colors">
                              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                              Saved posts
                            </a>
                            <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a24] hover:text-white transition-colors">
                              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Stats
                            </a>
                            <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a24] hover:text-white transition-colors">
                              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Settings
                            </a>
                          </div>
                          <div className="border-t border-[#24243a] pt-1 mt-1">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Sign in
                  </button>

                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="rounded-full bg-gradient-to-r from-[#5b3d8a] to-[#7c5aad] px-5 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-[#5b3d8a]/30"
                  >
                    Get started
                  </button>
                </>
              )}
            </nav>

          </div>
        </div>
      </header>

      {/* Modals */}
      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />
      )}
    </>
  )
}

export default Header
