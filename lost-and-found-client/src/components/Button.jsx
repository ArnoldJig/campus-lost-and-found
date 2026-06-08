import React, { useState } from 'react';

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style = {},
}) {
  const [hovered, setHovered] = useState(false);

  const base = {
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.2s ease',
    transform: hovered && !disabled ? 'scale(1.02)' : 'scale(1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    letterSpacing: '0.2px',
    ...sizeStyles[size],
    ...variantStyles(hovered)[variant],
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

const sizeStyles = {
  sm: { padding: '7px 14px', fontSize: '13px' },
  md: { padding: '10px 20px', fontSize: '14px' },
  lg: { padding: '12px 24px', fontSize: '15px' },
};

function variantStyles(hovered) {
  return {
    primary: {
      backgroundColor: hovered ? '#C4733A' : '#D4845A',
      color: '#FFF8F2',
      boxShadow: hovered ? '0 4px 16px rgba(212,132,90,0.4)' : '0 1px 4px rgba(212,132,90,0.25)',
    },
    danger: {
      backgroundColor: hovered ? '#B83232' : '#CC4444',
      color: '#FFF2F2',
      boxShadow: hovered ? '0 4px 16px rgba(204,68,68,0.3)' : 'none',
    },
    success: {
      backgroundColor: hovered ? '#2D7A42' : '#3D8B52',
      color: '#F2FFF5',
      boxShadow: hovered ? '0 4px 16px rgba(61,139,82,0.3)' : 'none',
    },
    outline: {
      backgroundColor: hovered ? 'rgba(212,132,90,0.12)' : 'transparent',
      color: hovered ? '#C4733A' : '#D4845A',
      border: '1px solid #D4845A',
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: hovered ? 'rgba(212,132,90,0.1)' : 'transparent',
      color: hovered ? '#D4845A' : '#8A7060',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    white: {
      backgroundColor: hovered ? 'rgba(200,191,168,0.8)' : 'rgba(200,191,168,0.6)',
      color: '#2C1F0E',
      border: '1px solid rgba(180,165,140,0.5)',
      boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.08)',
    },
  };
}

export default Button;