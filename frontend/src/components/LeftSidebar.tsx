import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
}

const SidebarItem = ({ icon, label, to, isActive }: SidebarItemProps) => {
  const itemClasses = `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
    isActive
      ? 'bg-[#E07A5F]/10 text-[#E07A5F]'
      : 'text-[#3D405B] hover:bg-[#FAF7F2]'
  }`;

  return (
    <Link to={to} className={itemClasses}>
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeftSidebar = ({ isOpen, onClose }: LeftSidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-[#E8E2D9] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto py-6 px-4">
          <nav className="space-y-2">
            {/* Home */}
            <SidebarItem
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }
              label="Home"
              to="/feed"
              isActive={location.pathname === '/feed'}
            />

            {/* Library */}
            <SidebarItem
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              }
              label="Library"
              to="/library?tab=saved"
              isActive={location.pathname === '/library'}
            />

            {/* Profile */}
            <SidebarItem
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              label="Profile"
              to={user ? `/user/${user.username}` : '#'}
              isActive={location.pathname === `/user/${user?.username}`}
            />

            {/* Stories */}
            <SidebarItem
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              label="Stories"
              to="/stories?tab=drafts"
              isActive={location.pathname === '/stories'}
            />

            {/* Stats */}
            <SidebarItem
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              label="Stats"
              to="/stats"
              isActive={location.pathname === '/stats'}
            />

            {/* Following */}
            <SidebarItem
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              label="Following"
              to="/following?tab=writers"
              isActive={location.pathname === '/following'}
            />
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-[#E8E2D9]" />

          {/* Write CTA */}
          <Link
            to="/create-post"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#E07A5F] text-white text-sm font-medium transition-all hover:bg-[#d36b52] hover:shadow-md"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Write a story
          </Link>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;
