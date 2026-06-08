import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ItemCard({ item, dark }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/items/${item.id}`}
      style={{
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'block',
        cursor: 'pointer',
        background: dark
          ? 'rgba(200,191,168,0.9)'
          : 'rgba(26,22,16,0.95)',
        border: `1px solid ${hovered
          ? '#D4845A'
          : dark
            ? 'rgba(92,58,30,0.2)'
            : 'rgba(212,132,90,0.15)'}`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,0.15)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'relative', height: '170px' }}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            backgroundColor: dark
              ? 'rgba(180,165,140,0.4)'
              : 'rgba(40,30,18,0.8)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '24px', opacity: 0.4 }}>📷</span>
            <span style={{ fontSize: '12px', color: dark ? '#7A5C3A' : '#8A7060' }}>No image</span>
          </div>
        )}
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          fontSize: '11px', fontWeight: '600',
          padding: '3px 10px', borderRadius: '20px',
          backgroundColor: item.type === 'lost' ? '#CC4444' : '#3D8B52',
          color: '#FFF8F2',
          letterSpacing: '0.3px',
        }}>
          {item.type === 'lost' ? 'Lost' : 'Found'}
        </span>
      </div>
      <div style={{ padding: '14px' }}>
        <h3 style={{
          fontSize: '14px', fontWeight: '600', marginBottom: '8px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: hovered ? '#D4845A' : dark ? '#2C1F0E' : '#E8D8C0',
          transition: 'color 0.2s ease',
        }}>{item.title}</h3>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {item.category_name && (
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
              backgroundColor: dark
                ? 'rgba(92,58,30,0.1)'
                : 'rgba(212,132,90,0.1)',
              color: dark ? '#7A5030' : '#C8A880',
              border: `1px solid ${dark
                ? 'rgba(92,58,30,0.15)'
                : 'rgba(212,132,90,0.2)'}`,
            }}>{item.category_name}</span>
          )}
          {item.color && (
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
              backgroundColor: dark
                ? 'rgba(92,58,30,0.1)'
                : 'rgba(212,132,90,0.1)',
              color: dark ? '#7A5030' : '#C8A880',
              border: `1px solid ${dark
                ? 'rgba(92,58,30,0.15)'
                : 'rgba(212,132,90,0.2)'}`,
            }}>{item.color}</span>
          )}
        </div>
        {item.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px' }}>📍</span>
            <span style={{
              fontSize: '12px',
              color: dark ? '#8A6040' : '#A08060',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{item.location}</span>
          </div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '10px',
          borderTop: `1px solid ${dark
            ? 'rgba(92,58,30,0.15)'
            : 'rgba(212,132,90,0.12)'}`,
        }}>
          <span style={{
            fontSize: '12px', fontWeight: '500',
            color: dark ? '#5C3A1E' : '#C8A880',
          }}>{item.reporter_name}</span>
          <span style={{ fontSize: '11px', color: dark ? '#A08060' : '#7A5840' }}>
            {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ItemCard;