'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const RESIDENT_LINKS = [
  { to: '/dashboard',      icon: '◈', label: 'My Complaints' },
  { to: '/complaints/new', icon: '+', label: 'Raise Complaint' },
  { to: '/notices',        icon: '◉', label: 'Notice Board' },
];

const ADMIN_LINKS = [
  { to: '/admin',            icon: '◈', label: 'Dashboard' },
  { to: '/admin/complaints', icon: '≡', label: 'All Complaints' },
  { to: '/notices',          icon: '◉', label: 'Notice Board' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router   = useRouter();
  const pathname = usePathname();

  const handleLogout = () => { logout(); router.push('/login'); };

  if (!user) return null;

  const links = user.role === 'admin' ? ADMIN_LINKS : RESIDENT_LINKS;

  const isActive = (to) => {
    if (to === '/admin' || to === '/dashboard') return pathname === to;
    return pathname.startsWith(to);
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">Society Maintenance</div>
        <div className="sidebar-brand-sub">Tracker</div>
      </div>

      {/* Role label */}
      <div className="sidebar-role-label">
        {user.role === 'admin' ? 'Admin Panel' : 'Resident Portal'}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.to}
            href={link.to}
            className={`sidebar-link${isActive(link.to) ? ' active' : ''}`}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        {/* Theme toggle */}
        <button
          className="sidebar-theme-toggle"
          onClick={toggle}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          id="theme-toggle-btn"
        >
          <span className="sidebar-link-icon">{theme === 'light' ? '◑' : '○'}</span>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>

        {/* Sign out */}
        <button className="sidebar-link sidebar-signout" onClick={handleLogout}>
          <span className="sidebar-link-icon">→</span>
          Sign Out
        </button>

        {/* User info */}
        <div className="sidebar-user-block">
          <div className="sidebar-user-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-meta">
              {user.apartmentNo ? `Apt ${user.apartmentNo}` : ''}{' '}
              · <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
