import React, { useEffect, useState } from 'react';
import { getNotifications, markAllRead, markOneRead } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { FadeIn, StaggerList, StaggerItem } from '../components/Animated';
import Button from '../components/Button';

function Notifications() {
  const { dark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    try { const res = await getNotifications(); setNotifications(res.data.notifications); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleMarkAllRead() {
    try { await markAllRead(); setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); }
    catch (err) { console.error(err); }
  }

  async function handleMarkRead(id) {
    try { await markOneRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); }
    catch (err) { console.error(err); }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const cardBg = dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)';
  const borderColor = dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.15)';
  const textColor = dark ? '#2C1F0E' : '#E8D8C0';
  const mutedColor = dark ? '#8A6040' : '#A08060';

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', paddingTop: '30px' }}>
      <FadeIn delay={0}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: textColor, margin: 0 }}>Notifications</h2>
            {unreadCount > 0 && <p style={{ fontSize: '12px', color: '#D4845A', marginTop: '3px' }}>{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && <Button onClick={handleMarkAllRead} variant="outline" size="sm">Mark all read</Button>}
        </div>
      </FadeIn>

      {loading && <p style={{ textAlign: 'center', color: mutedColor, padding: '40px', fontSize: '13px' }}>Loading...</p>}

      {!loading && notifications.length === 0 && (
        <FadeIn>
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: cardBg, borderRadius: '12px',
            border: `1px solid ${borderColor}`,
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔔</div>
            <h3 style={{ color: textColor, marginBottom: '6px', fontSize: '16px', fontWeight: '600' }}>No notifications yet</h3>
            <p style={{ color: mutedColor, fontSize: '13px' }}>You'll be notified when something important happens</p>
          </div>
        </FadeIn>
      )}

      {!loading && notifications.length > 0 && (
        <StaggerList style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((notif) => {
            const isMatch = notif.message.startsWith('🔍');
            const isMessage = notif.message.startsWith('💬');
            const accentColor = isMatch ? '#D4845A' : isMessage ? '#3D8B52' : '#C8A880';
            return (
              <StaggerItem key={notif.id}>
                <div
                  onClick={() => handleMarkRead(notif.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                    background: notif.is_read
                      ? cardBg
                      : dark ? 'rgba(220,200,170,0.95)' : 'rgba(40,28,14,0.95)',
                    border: `1px solid ${notif.is_read ? borderColor : 'rgba(212,132,90,0.3)'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: `${accentColor}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                    border: `1px solid ${accentColor}30`,
                  }}>
                    {notif.message.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0, fontSize: '13px', color: textColor,
                      lineHeight: '1.5', fontWeight: notif.is_read ? '400' : '500',
                    }}>
                      {notif.message.slice(2)}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: mutedColor }}>
                      {new Date(notif.sent_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      backgroundColor: '#D4845A', flexShrink: 0, marginTop: '6px',
                    }} />
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerList>
      )}
    </div>
  );
}

export default Notifications;