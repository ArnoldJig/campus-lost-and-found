import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminItems, getAdminMatches, getAdminUsers, updateItemStatus, deleteItem } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import { FadeIn, SlideIn, StaggerList, StaggerItem } from '../components/Animated';

function StatCard({ stat, dark }) {
  const [hovered, setHovered] = useState(false);
  const cardBg = dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)';
  const borderColor = dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.15)';
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cardBg,
        border: `1px solid ${hovered ? '#D4845A' : borderColor}`,
        borderTop: `3px solid ${stat.color}`,
        borderRadius: '10px', padding: '18px', textAlign: 'center',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.08)',
        cursor: 'default',
      }}
    >
      <p style={{ fontSize: '28px', fontWeight: '700', color: stat.color, margin: 0 }}>{stat.value}</p>
      <p style={{ fontSize: '12px', color: dark ? '#8A6040' : '#A08060', marginTop: '4px' }}>{stat.label}</p>
    </div>
  );
}

function TabButton({ label, active, onClick, dark }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
        cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s ease',
        backgroundColor: active
          ? '#D4845A'
          : hovered ? 'rgba(212,132,90,0.1)' : 'transparent',
        color: active ? '#FFF8F2' : hovered ? '#D4845A' : dark ? '#5C3A1E' : '#C8A880',
        border: `1px solid ${active
          ? '#D4845A'
          : dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.2)'}`,
      }}
    >
      {label}
    </button>
  );
}

function Admin() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const [tab, setTab] = useState('items');
  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [ir, mr, ur] = await Promise.all([getAdminItems(), getAdminMatches(), getAdminUsers()]);
      setItems(ir.data.items); setMatches(mr.data.matches); setUsers(ur.data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleStatusChange(id, status) {
    try { await updateItemStatus(id, status); fetchAll(); } catch (err) { console.error(err); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure?')) return;
    try { await deleteItem(id); fetchAll(); } catch (err) { console.error(err); }
  }

  const stats = [
    { label: 'Total Items', value: items.length, color: '#D4845A' },
    { label: 'Lost Items', value: items.filter(i => i.type === 'lost').length, color: '#CC4444' },
    { label: 'Found Items', value: items.filter(i => i.type === 'found').length, color: '#3D8B52' },
    { label: 'Matches', value: matches.length, color: '#C8A040' },
    { label: 'Users', value: users.length, color: '#5C7A8B' },
    { label: 'Resolved', value: items.filter(i => i.status === 'resolved').length, color: '#2D7A42' },
  ];

  const cardBg = dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)';
  const borderColor = dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.15)';
  const thBg = dark ? 'rgba(180,165,140,0.5)' : 'rgba(40,30,18,0.8)';
  const textColor = dark ? '#2C1F0E' : '#E8D8C0';
  const mutedColor = dark ? '#8A6040' : '#A08060';
  const inputBg = dark ? 'rgba(180,165,140,0.4)' : 'rgba(40,30,18,0.8)';

  const thStyle = {
    padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600',
    backgroundColor: thBg, color: mutedColor, borderBottom: `1px solid ${borderColor}`,
    letterSpacing: '0.5px', textTransform: 'uppercase',
  };
  const tdStyle = {
    padding: '12px 14px', fontSize: '13px', verticalAlign: 'middle',
    borderBottom: `1px solid ${borderColor}`,
  };

  return (
    <div>
      <SlideIn direction="up" delay={0}>
        <div style={{
          background: dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)',
          padding: '28px 32px', borderRadius: '12px', marginBottom: '20px',
          border: `1px solid ${dark ? 'rgba(92,58,30,0.25)' : 'rgba(212,132,90,0.2)'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: dark ? '#2C1F0E' : '#E8D8C0' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: dark ? 'rgba(44,31,14,0.55)' : 'rgba(232,216,192,0.55)', marginTop: '4px', fontSize: '13px' }}>
            Campus Lost and Found Management
          </p>
        </div>
      </SlideIn>

      <StaggerList style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {stats.map(stat => <StaggerItem key={stat.label}><StatCard stat={stat} dark={dark} /></StaggerItem>)}
      </StaggerList>

      <FadeIn delay={0.15}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['items', 'matches', 'users'].map(t => (
            <TabButton key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={tab === t} onClick={() => setTab(t)} dark={dark} />
          ))}
        </div>
      </FadeIn>

      {loading && <p style={{ textAlign: 'center', padding: '32px', color: mutedColor, fontSize: '13px' }}>Loading...</p>}

      {!loading && tab === 'items' && (
        <FadeIn>
          <div style={{ background: cardBg, borderRadius: '10px', overflow: 'auto', border: `1px solid ${borderColor}`, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Title', 'Type', 'Category', 'Reporter', 'Status', 'Date', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '500', color: textColor, fontSize: '13px' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: mutedColor, marginTop: '2px' }}>{item.location}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '600',
                        backgroundColor: item.type === 'lost' ? '#CC4444' : '#3D8B52',
                        color: '#FFF8F2',
                      }}>{item.type}</span>
                    </td>
                    <td style={{ ...tdStyle, color: mutedColor }}>{item.category_name || '—'}</td>
                    <td style={tdStyle}>
                      <div style={{ color: textColor, fontSize: '13px' }}>{item.reporter_name}</div>
                      <div style={{ fontSize: '11px', color: mutedColor }}>{item.reporter_email}</div>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        style={{
                          padding: '5px 8px', borderRadius: '6px', fontSize: '12px',
                          cursor: 'pointer', backgroundColor: inputBg,
                          color: textColor, border: `1px solid ${borderColor}`,
                        }}
                      >
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td style={{ ...tdStyle, color: mutedColor, fontSize: '12px' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td style={tdStyle}><Button onClick={() => handleDelete(item.id)} variant="danger" size="sm">Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}

      {!loading && tab === 'matches' && (
        <FadeIn>
          <div style={{ background: cardBg, borderRadius: '10px', overflow: 'auto', border: `1px solid ${borderColor}`, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Lost Item', 'Found Item', 'Confidence', 'Status', 'Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {matches.map(match => (
                  <tr key={match.id}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {match.lost_image && <img src={match.lost_image} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <div>
                          <div style={{ fontWeight: '500', color: textColor, fontSize: '12px' }}>{match.lost_title}</div>
                          <div style={{ fontSize: '11px', color: mutedColor }}>{match.lost_reporter}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {match.found_image && <img src={match.found_image} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <div>
                          <div style={{ fontWeight: '500', color: textColor, fontSize: '12px' }}>{match.found_title}</div>
                          <div style={{ fontSize: '11px', color: mutedColor }}>{match.found_reporter}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#D4845A' }}>
                        {Math.round(match.confidence_score * 100)}%
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '500',
                        backgroundColor: 'rgba(212,132,90,0.1)',
                        color: '#D4845A', border: '1px solid rgba(212,132,90,0.2)',
                      }}>{match.status}</span>
                    </td>
                    <td style={{ ...tdStyle, color: mutedColor, fontSize: '12px' }}>{new Date(match.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}

      {!loading && tab === 'users' && (
        <FadeIn>
          <div style={{ background: cardBg, borderRadius: '10px', overflow: 'auto', border: `1px solid ${borderColor}`, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Name', 'Email', 'Role', 'Joined'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ ...tdStyle, color: textColor, fontWeight: '500', fontSize: '13px' }}>{u.full_name}</td>
                    <td style={{ ...tdStyle, color: mutedColor, fontSize: '13px' }}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '500',
                        backgroundColor: u.role === 'admin'
                          ? 'rgba(212,132,90,0.15)'
                          : dark ? 'rgba(92,58,30,0.08)' : 'rgba(212,132,90,0.05)',
                        color: u.role === 'admin' ? '#D4845A' : mutedColor,
                        border: `1px solid ${u.role === 'admin' ? 'rgba(212,132,90,0.3)' : borderColor}`,
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: mutedColor, fontSize: '12px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

export default Admin;