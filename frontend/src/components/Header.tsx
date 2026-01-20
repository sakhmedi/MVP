import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignupModal from './SignupModal';
import LoginModal from './LoginModal';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="border-b border-black">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

          {/* Left side */}
          <Link to="/" className="text-xl font-semibold hover:text-gray-600">
            Blog
          </Link>

          {/* Right side navigation */}
          <nav className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-gray-600">Our story</a>
            <a href="#" className="hover:text-gray-600">Membership</a>

            {isAuthenticated ? (
              <>
                <Link to="/create-post" className="hover:text-gray-600">Write</Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:text-gray-600"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      {user?.username?.[0].toUpperCase() || 'U'}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">
                        Profile
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">
                        Settings
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="hover:text-gray-600"
                >
                  Sign in
                </button>

                <button
                  onClick={() => setShowSignupModal(true)}
                  className="rounded-full bg-black px-4 py-2 text-white hover:bg-gray-800"
                >
                  Get started
                </button>
              </>
            )}
          </nav>

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
