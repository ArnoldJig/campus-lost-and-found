import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';
import { getUnreadCount } from '../services/api';

function NavLink({ to, children, dark }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        fontSize: '14px',
        fontWeight: isActive ? '600' : '400',
        color: isActive
          ? '#D4845A'
          : hovered
            ? '#D4845A'
            : dark ? '#C8A880' : '#5C3A1E',
        padding: '6px 12px',
        borderRadius: '6px',
        backgroundColor: hovered
          ? 'rgba(212,132,90,0.1)'
          : isActive
            ? 'rgba(212,132,90,0.08)'
            : 'transparent',
        transition: 'all 0.2s ease',
        display: 'inline-block',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

function RegisterLink() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to="/register"
      style={{
        backgroundColor: hovered ? '#C4733A' : '#D4845A',
        color: '#FFF8F2',
        padding: '8px 18px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered
          ? '0 4px 16px rgba(212,132,90,0.4)'
          : '0 1px 4px rgba(212,132,90,0.25)',
        display: 'inline-block',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Get Started
    </Link>
  );
}

function NotificationBell({ dark }) {
  const [unread, setUnread] = useState(0);
  const [hovered, setHovered] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [location]);

  async function fetchCount() {
    try {
      const res = await getUnreadCount();
      setUnread(res.data.count);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Link
      to="/notifications"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        backgroundColor: hovered ? 'rgba(212,132,90,0.1)' : 'transparent',
        transition: 'all 0.2s ease',
        fontSize: '17px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Notifications"
    >
      🔔
      {unread > 0 && (
        <span style={{
          position: 'absolute',
          top: '3px',
          right: '3px',
          backgroundColor: '#D4845A',
          color: '#FFF8F2',
          fontSize: '9px',
          fontWeight: '700',
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { dark, toggleTheme } = useTheme();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <nav style={{
      backgroundColor: dark
        ? 'rgba(26,22,16,0.98)'
        : 'rgba(200,191,168,0.98)',
      borderBottom: `1px solid ${dark
        ? 'rgba(212,132,90,0.15)'
        : 'rgba(92,58,30,0.2)'}`,
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={styles.inner}>
        <Link to="/" style={{
          ...styles.brand,
          color: dark ? '#E8D8C0' : '#2C1F0E',
        }}>
          <span style={{ color: '#D4845A', fontSize: '20px' }}>◎</span>
          CampusFind
        </Link>

        <div style={styles.links}>
          <NavLink to="/" dark={dark}>Home</NavLink>

          {token ? (
            <>
              <NavLink to="/report" dark={dark}>Report Item</NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/admin" dark={dark}>Admin</NavLink>
              )}
              <NotificationBell dark={dark} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingLeft: '16px',
                marginLeft: '4px',
                borderLeft: `1px solid ${dark
                  ? 'rgba(212,132,90,0.2)'
                  : 'rgba(92,58,30,0.2)'}`,
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: dark ? '#C8A880' : '#5C3A1E',
                }}>
                  {user?.full_name?.split(' ')[0]}
                </span>
                <Button onClick={handleLogout} variant="ghost" size="sm">Logout</Button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" dark={dark}>Login</NavLink>
              <RegisterLink />
            </>
          )}

          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: 'transparent',
              border: `1px solid ${dark
                ? 'rgba(212,132,90,0.2)'
                : 'rgba(92,58,30,0.2)'}`,
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '14px',
              cursor: 'pointer',
              color: dark ? '#C8A880' : '#5C3A1E',
              transition: 'all 0.2s',
              marginLeft: '4px',
            }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '-0.3px',
  },
  links: { display: 'flex', alignItems: 'center', gap: '4px' },
};

export default Navbar;