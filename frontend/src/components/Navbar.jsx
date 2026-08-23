import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RESIDENT_LINKS = [
  { to: '/dashboard',        icon: '🏠', label: 'My Complaints' },
  { to: '/complaints/new',   icon: '➕', label: 'Raise Complaint' },
  { to: '/notices',          icon: '📢', label: 'Notice Board' },
];

const ADMIN_LINKS = [
  { to: '/admin',            icon: '📊', label: 'Dashboard' },
  { to: '/admin/complaints', icon: '📋', label: 'All Complaints' },
  { to: '/notices',          icon: '📢', label: 'Notice Board' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const links = user.role === 'admin' ? ADMIN_LINKS : RESIDENT_LINKS;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🏢</span>
        <div>
          <div className="logo-text">Society</div>
          <div className="logo-sub">Maintenance Tracker</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">
          {user.role === 'admin' ? 'Admin Panel' : 'Resident Portal'}
        </span>

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/dashboard'}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}

        <span className="sidebar-section-label" style={{ marginTop: '12px' }}>Account</span>

        <button onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Sign Out
        </button>
      </nav>

      <div className="sidebar-user">
        <div className="user-name" title={user.name}>{user.name}</div>
        {user.apartmentNo && <div className="user-apt">Apt {user.apartmentNo}</div>}
        <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '2px', textTransform: 'capitalize' }}>
          {user.role}
        </div>
      </div>
    </aside>
  );
}
