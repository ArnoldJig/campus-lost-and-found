import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import { FadeIn, SlideIn } from '../components/Animated';

function Register() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await register(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  }

  const cardBg = dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)';
  const borderColor = dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.15)';
  const inputBg = dark ? 'rgba(180,165,140,0.4)' : 'rgba(40,30,18,0.8)';
  const inputBorder = dark ? 'rgba(92,58,30,0.25)' : 'rgba(212,132,90,0.2)';
  const textColor = dark ? '#2C1F0E' : '#E8D8C0';
  const labelColor = dark ? '#5C3A1E' : '#C8A880';
  const mutedColor = dark ? '#8A6040' : '#A08060';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
      <SlideIn direction="up" delay={0}>
        <div style={{
          background: cardBg, padding: '40px', borderRadius: '12px',
          border: `1px solid ${borderColor}`, width: '100%', maxWidth: '400px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <FadeIn delay={0.1}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '32px', color: '#D4845A', marginBottom: '12px' }}>◎</div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: textColor, marginBottom: '6px' }}>Create account</h2>
              <p style={{ fontSize: '13px', color: mutedColor }}>Join CampusFind and never lose anything again</p>
            </div>
          </FadeIn>

          {error && (
            <SlideIn direction="up">
              <div style={{
                backgroundColor: 'rgba(204,68,68,0.15)',
                color: '#CC4444', padding: '10px 14px', borderRadius: '8px',
                marginBottom: '16px', fontSize: '13px',
                border: '1px solid rgba(204,68,68,0.25)',
              }}>
                ⚠ {error}
              </div>
            </SlideIn>
          )}

          <FadeIn delay={0.15}>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Full name', name: 'full_name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email address', name: 'email', type: 'email', placeholder: 'you@university.edu' },
                { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
              ].map(field => (
                <div key={field.name} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: labelColor, marginBottom: '6px' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type} name={field.name}
                    value={form[field.name]} onChange={handleChange}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: `1px solid ${inputBorder}`, fontSize: '14px',
                      backgroundColor: inputBg, color: textColor,
                    }}
                    placeholder={field.placeholder} required
                  />
                </div>
              ))}
              <div style={{ marginTop: '20px' }}>
                <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: mutedColor }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#D4845A', fontWeight: '500' }}>Sign in</Link>
            </p>
          </FadeIn>
        </div>
      </SlideIn>
    </div>
  );
}

export default Register;