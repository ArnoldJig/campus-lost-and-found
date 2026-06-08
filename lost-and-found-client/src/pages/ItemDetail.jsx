import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItem, getMatches } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import { FadeIn, SlideIn, StaggerList, StaggerItem } from '../components/Animated';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      try { const res = await getItem(id); setItem(res.data.item); }
      catch (err) { console.error(err); } finally { setLoading(false); }
    }
    async function fetchMatches() {
      try { const res = await getMatches(id); setMatches(res.data.matches); }
      catch (err) { console.error(err); } finally { setMatchLoading(false); }
    }
    fetchItem(); fetchMatches();
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center', padding: '60px', color: '#A08060' }}>Loading...</p>;
  if (!item) return <p style={{ textAlign: 'center', padding: '60px', color: '#A08060' }}>Item not found.</p>;

  const cardBg = dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)';
  const borderColor = dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.15)';
  const textColor = dark ? '#E8D8C0' : '#2C1F0E';
  const mutedColor = dark ? '#8A6040' : '#A08060';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '30px', gap: '24px' }}>
      <SlideIn direction="up" delay={0}>
        <div style={{
          background: cardBg, borderRadius: '12px', width: '100%', maxWidth: '580px',
          overflow: 'hidden', border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          {item.image_url && <img src={item.image_url} alt={item.title} style={{ width: '100%', maxHeight: '280px', objectFit: 'cover' }} />}
          <div style={{ padding: '24px' }}>
            <FadeIn delay={0.1}>
              <span style={{
                display: 'inline-block', fontSize: '11px', fontWeight: '600',
                padding: '3px 10px', borderRadius: '20px', marginBottom: '10px',
                backgroundColor: item.type === 'lost' ? '#CC4444' : '#3D8B52',
                color: '#FFF8F2', letterSpacing: '0.3px',
              }}>
                {item.type.toUpperCase()}
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px', color: textColor }}>{item.title}</h2>
              <p style={{ fontSize: '14px', color: mutedColor, marginBottom: '20px', lineHeight: '1.6' }}>{item.description}</p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Category', value: item.category_name || '—' },
                  { label: 'Colour', value: item.color || '—' },
                  { label: 'Location', value: item.location || '—' },
                  { label: 'Reported by', value: item.reporter_name },
                  { label: 'Date', value: new Date(item.created_at).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: mutedColor }}>{label}</span>
                    <span style={{ color: textColor, fontWeight: '500' }}>{value}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </SlideIn>

      <FadeIn delay={0.15}>
        <div style={{ width: '100%', maxWidth: '580px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', color: textColor }}>
            {item.type === 'lost' ? 'Potential Found Matches' : 'Potential Lost Item Matches'}
          </h3>

          {matchLoading && <p style={{ textAlign: 'center', padding: '32px', color: mutedColor, fontSize: '13px' }}>Searching for matches...</p>}

          {!matchLoading && matches.length === 0 && (
            <div style={{
              borderRadius: '10px', padding: '32px', textAlign: 'center',
              background: cardBg, border: `1px solid ${borderColor}`,
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
              <p style={{ color: textColor, fontWeight: '500', fontSize: '14px' }}>No matches found yet.</p>
              <p style={{ color: mutedColor, fontSize: '13px', marginTop: '6px' }}>You will be notified when a potential match is found.</p>
            </div>
          )}

          {!matchLoading && matches.length > 0 && (
            <StaggerList style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matches.map((match) => (
                <StaggerItem key={match.item_id}>
                  <div style={{
                    borderRadius: '10px', overflow: 'hidden', display: 'flex',
                    background: cardBg, border: `1px solid ${borderColor}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}>
                    {match.image_url ? (
                      <img src={match.image_url} alt={match.title} style={{ width: '100px', height: '100px', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: '100px', height: '100px',
                        backgroundColor: dark ? 'rgba(180,165,140,0.4)' : 'rgba(40,30,18,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: mutedColor, fontSize: '12px', flexShrink: 0,
                      }}>No image</div>
                    )}
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: textColor }}>{match.title}</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {[
                          { label: 'Confidence', value: `${Math.round(match.confidence_score * 100)}%`, accent: true },
                          { label: 'Image', value: `${Math.round(match.image_score * 100)}%` },
                          { label: 'Text', value: `${Math.round(match.text_score * 100)}%` },
                        ].map(({ label, value, accent }) => (
                          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontSize: '10px', color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: accent ? '#D4845A' : mutedColor }}>{value}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Link to={`/items/${match.item_id}`} style={{ color: '#D4845A', fontSize: '13px', fontWeight: '500' }}>View item</Link>
                        {match.match_id && (
                          <Button onClick={() => navigate(`/chat/${match.match_id}/${match.receiver_id}`)} variant="primary" size="sm">
                            Message
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </div>
      </FadeIn>
    </div>
  );
}

export default ItemDetail;