import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import { FadeIn, SlideIn } from '../components/Animated';

const CATEGORIES = ['Electronics', 'Clothing', 'Keys', 'Bags', 'Books', 'Jewellery', 'Documents', 'Other'];

function TypeButton({ active, onClick, label, type, dark }) {
  const [hovered, setHovered] = useState(false);
  const isLost = type === 'lost';
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px',
        cursor: 'pointer', transition: 'all 0.2s ease',
        backgroundColor: active
          ? isLost ? '#CC4444' : '#3D8B52'
          : hovered ? 'rgba(212,132,90,0.08)' : 'transparent',
        color: active ? '#FFF8F2' : dark ? '#5C3A1E' : '#C8A880',
        border: `1px solid ${active
          ? isLost ? '#CC4444' : '#3D8B52'
          : dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.2)'}`,
        fontWeight: active ? '500' : '400',
      }}
    >
      {label}
    </button>
  );
}

function ReportItem() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', color: '', location: '', category_id: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function handleImage(e) {
    const file = e.target.files[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (image) formData.append('image', image);
      await createItem(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report.');
    } finally { setLoading(false); }
  }

  const cardBg = dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)';
  const borderColor = dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.15)';
  const inputBg = dark ? 'rgba(180,165,140,0.4)' : 'rgba(40,30,18,0.8)';
  const inputBorder = dark ? 'rgba(92,58,30,0.25)' : 'rgba(212,132,90,0.2)';
  const textColor = dark ? '#2C1F0E' : '#E8D8C0';
  const labelColor = dark ? '#5C3A1E' : '#C8A880';
  const mutedColor = dark ? '#8A6040' : '#A08060';
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: `1px solid ${inputBorder}`, fontSize: '14px',
    backgroundColor: inputBg, color: textColor,
  };
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '500',
    color: labelColor, marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '30px', paddingBottom: '60px' }}>
      <SlideIn direction="up" delay={0}>
        <div style={{
          background: cardBg, padding: '40px', borderRadius: '12px',
          border: `1px solid ${borderColor}`, width: '100%', maxWidth: '560px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <FadeIn delay={0.1}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: textColor, marginBottom: '6px' }}>Report an Item</h2>
              <p style={{ fontSize: '13px', color: mutedColor }}>Fill in the details to report a lost or found item</p>
            </div>
          </FadeIn>

          {error && (
            <SlideIn direction="up">
              <div style={{
                backgroundColor: 'rgba(204,68,68,0.15)',
                color: '#CC4444', padding: '10px 14px', borderRadius: '8px',
                marginBottom: '16px', fontSize: '13px',
                border: '1px solid rgba(204,68,68,0.25)',
              }}>⚠ {error}</div>
            </SlideIn>
          )}

          <FadeIn delay={0.15}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <TypeButton active={form.type === 'lost'} onClick={() => setForm({ ...form, type: 'lost' })} label="😟 I Lost Something" type="lost" dark={dark} />
                <TypeButton active={form.type === 'found'} onClick={() => setForm({ ...form, type: 'found' })} label="😊 I Found Something" type="found" dark={dark} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Title <span style={{ color: '#CC4444' }}>*</span></label>
                <input name="title" value={form.title} onChange={handleChange} style={inputStyle} placeholder="e.g. Black iPhone 14 Pro" required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} style={{ ...inputStyle, height: '90px', resize: 'vertical' }} placeholder="Describe the item in detail..." />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ marginBottom: '16px', flex: 1 }}>
                  <label style={labelStyle}>Category</label>
                  <select name="category_id" value={form.category_id} onChange={handleChange} style={inputStyle}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '16px', flex: 1 }}>
                  <label style={labelStyle}>Colour</label>
                  <input name="color" value={form.color} onChange={handleChange} style={inputStyle} placeholder="e.g. Black" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Location</label>
                <input name="location" value={form.location} onChange={handleChange} style={inputStyle} placeholder="e.g. Main Library, Block A" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Photo</label>
                <div style={{ border: `2px dashed ${borderColor}`, borderRadius: '8px', overflow: 'hidden' }}>
                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                      <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} style={{
                        position: 'absolute', top: '8px', right: '8px',
                        backgroundColor: 'rgba(26,22,16,0.8)', border: 'none',
                        color: '#E8D8C0', borderRadius: '6px', padding: '5px 10px',
                        fontSize: '12px', cursor: 'pointer',
                      }}>Remove</button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', cursor: 'pointer', gap: '6px' }}>
                      <div style={{ fontSize: '28px' }}>📷</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: labelColor }}>Click to upload a photo</div>
                      <div style={{ fontSize: '12px', color: mutedColor }}>PNG, JPG up to 10MB</div>
                      <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              <Button type="submit" variant={form.type === 'lost' ? 'danger' : 'success'} size="lg" fullWidth disabled={loading}>
                {loading ? 'Submitting...' : `Submit ${form.type === 'lost' ? 'Lost' : 'Found'} Report`}
              </Button>
            </form>
          </FadeIn>
        </div>
      </SlideIn>
    </div>
  );
}

export default ReportItem;