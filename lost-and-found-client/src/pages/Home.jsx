import React, { useEffect, useState } from 'react';
import { getItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FadeIn, SlideIn, StaggerList, StaggerItem } from '../components/Animated';

function HeroLink({ to, children, primary }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{
        backgroundColor: primary
          ? hovered ? '#C4733A' : '#D4845A'
          : hovered ? 'rgba(232,216,192,0.2)' : 'rgba(232,216,192,0.1)',
        color: primary ? '#FFF8F2' : '#E8D8C0',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: primary
          ? hovered ? '0 6px 20px rgba(212,132,90,0.45)' : '0 2px 8px rgba(212,132,90,0.3)'
          : 'none',
        border: primary ? 'none' : '1px solid rgba(232,216,192,0.3)',
        display: 'inline-block',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

function FilterButton({ label, active, onClick, dark }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px 16px',
        borderRadius: '6px',
        border: `1px solid ${active
          ? '#D4845A'
          : dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.2)'}`,
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: active
          ? '#D4845A'
          : hovered ? 'rgba(212,132,90,0.1)' : 'transparent',
        color: active ? '#FFF8F2' : hovered ? '#D4845A' : dark ? '#5C3A1E' : '#C8A880',
      }}
    >
      {label}
    </button>
  );
}

function Home() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [heroHovered, setHeroHovered] = useState(false);
  const token = localStorage.getItem('token');
  const { dark } = useTheme();

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await getItems(filter ? { type: filter } : {});
        setItems(res.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [filter]);

  return (
    <div>
      <SlideIn direction="up" delay={0}>
        <div
          style={{
            background: dark
              ? 'rgba(200,191,168,0.9)'
              : 'rgba(26,22,16,0.95)',
            borderRadius: '12px',
            padding: '48px 44px',
            marginBottom: '32px',
            border: `1px solid ${dark
              ? 'rgba(92,58,30,0.25)'
              : 'rgba(212,132,90,0.2)'}`,
            transform: heroHovered ? 'scale(1.005)' : 'scale(1)',
            boxShadow: heroHovered
              ? '0 16px 48px rgba(0,0,0,0.2)'
              : '0 4px 16px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={() => setHeroHovered(true)}
          onMouseLeave={() => setHeroHovered(false)}
        >
          <div style={{ maxWidth: '560px' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(212,132,90,0.15)',
              color: '#D4845A',
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 12px',
              borderRadius: '20px',
              marginBottom: '20px',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              border: '1px solid rgba(212,132,90,0.25)',
            }}>
              AI-Powered Matching
            </div>
            <h1 style={{
              fontSize: '38px',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '14px',
              letterSpacing: '-0.8px',
              color: dark ? '#2C1F0E' : '#E8D8C0',
            }}>
              Lost something?<br />
              <span style={{ color: '#D4845A' }}>We'll help you find it.</span>
            </h1>
            <p style={{
              fontSize: '15px',
              color: dark ? 'rgba(44,31,14,0.65)' : 'rgba(232,216,192,0.65)',
              marginBottom: '28px',
              lineHeight: '1.6',
            }}>
              Report lost or found items on campus. Our AI automatically matches them for you.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}>
              {token ? (
                <HeroLink to="/report" primary>Report an Item</HeroLink>
              ) : (
                <>
                  <HeroLink to="/register" primary>Get Started</HeroLink>
                  <HeroLink to="/login">Login</HeroLink>
                </>
              )}
            </div>
          </div>
          <div style={{
            display: 'flex',
            backgroundColor: dark
              ? 'rgba(92,58,30,0.08)'
              : 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            padding: '16px 20px',
            width: 'fit-content',
            border: `1px solid ${dark
              ? 'rgba(92,58,30,0.15)'
              : 'rgba(212,132,90,0.12)'}`,
          }}>
            {[
              { num: items.length, label: 'Active Reports' },
              { num: items.filter(i => i.type === 'lost').length, label: 'Lost Items' },
              { num: items.filter(i => i.type === 'found').length, label: 'Found Items' },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <div style={{
                  width: '1px',
                  backgroundColor: dark
                    ? 'rgba(92,58,30,0.15)'
                    : 'rgba(212,132,90,0.15)',
                  margin: '0 4px',
                }} />}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#D4845A', lineHeight: '1' }}>{stat.num}</span>
                  <span style={{
                    fontSize: '11px',
                    color: dark ? 'rgba(44,31,14,0.5)' : 'rgba(232,216,192,0.5)',
                    marginTop: '4px',
                  }}>{stat.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </SlideIn>

      <FadeIn delay={0.1}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{
              fontSize: '18px', fontWeight: '600',
              color: dark ? '#E8D8C0' : '#2C1F0E',
            }}>
              Recent Reports
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { label: 'All', value: '' },
                { label: 'Lost', value: 'lost' },
                { label: 'Found', value: 'found' },
              ].map(({ label, value }) => (
                <FilterButton key={value} label={label} active={filter === value} onClick={() => setFilter(value)} dark={dark} />
              ))}
            </div>
          </div>

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  height: '260px', borderRadius: '10px',
                  backgroundColor: dark
                    ? 'rgba(180,165,140,0.4)'
                    : 'rgba(40,30,18,0.5)',
                }} />
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', borderRadius: '10px',
              background: dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)',
              border: `1px solid ${dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.15)'}`,
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <h3 style={{ color: dark ? '#2C1F0E' : '#E8D8C0', marginBottom: '6px', fontWeight: '600' }}>No items reported yet</h3>
              <p style={{ color: dark ? '#8A6040' : '#A08060', marginBottom: '20px', fontSize: '14px' }}>Be the first to report a lost or found item</p>
              {token && <HeroLink to="/report" primary>Report an Item</HeroLink>}
            </div>
          )}

          {!loading && items.length > 0 && (
            <StaggerList style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {items.map(item => (
                <StaggerItem key={item.id}>
                  <ItemCard item={item} dark={dark} />
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </div>
      </FadeIn>
    </div>
  );
}

export default Home;