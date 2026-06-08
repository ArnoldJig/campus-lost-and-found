import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../services/api';
import { useTheme } from '../context/ThemeContext';

function Chat() {
  const { matchId, receiverId } = useParams();
  const { dark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  async function fetchMessages() {
    try { const res = await getMessages(matchId); setMessages(res.data.messages); }
    catch (err) { console.error(err); }
  }

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text && !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('match_id', matchId);
      formData.append('receiver_id', receiverId);
      if (text) formData.append('content', text);
      if (image) formData.append('image', image);
      await sendMessage(formData);
      setText(''); setImage(null); fetchMessages();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const cardBg = dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)';
  const msgAreaBg = dark ? 'rgba(180,165,140,0.4)' : 'rgba(20,16,10,0.8)';
  const borderColor = dark ? 'rgba(92,58,30,0.2)' : 'rgba(212,132,90,0.15)';
  const textColor = dark ? '#2C1F0E' : '#E8D8C0';
  const mutedColor = dark ? '#8A6040' : '#A08060';
  const inputBg = dark ? 'rgba(180,165,140,0.4)' : 'rgba(40,30,18,0.8)';
  const headerBg = dark ? 'rgba(180,165,140,0.5)' : 'rgba(40,30,18,0.9)';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '30px' }}>
      <div style={{
        background: cardBg, borderRadius: '12px', width: '100%', maxWidth: '580px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '78vh',
        border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          backgroundColor: headerBg,
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <h3 style={{ color: textColor, fontSize: '16px', fontWeight: '600', margin: 0 }}>Chat</h3>
          <p style={{ color: mutedColor, fontSize: '12px', margin: '3px 0 0' }}>Discuss the item and arrange a handover</p>
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          backgroundColor: msgAreaBg,
        }}>
          {messages.length === 0 && (
            <p style={{ textAlign: 'center', color: mutedColor, padding: '32px 0', fontSize: '13px' }}>
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                {!isMe && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: '#D4845A', color: '#FFF8F2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '600', flexShrink: 0,
                  }}>
                    {msg.sender_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{
                  maxWidth: '68%', padding: '10px 14px', borderRadius: '12px',
                  backgroundColor: isMe
                    ? '#D4845A'
                    : dark ? 'rgba(200,191,168,0.9)' : 'rgba(26,22,16,0.95)',
                  color: isMe ? '#FFF8F2' : textColor,
                  border: isMe ? 'none' : `1px solid ${borderColor}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  {!isMe && <p style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#D4845A' }}>{msg.sender_name}</p>}
                  {msg.content && <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{msg.content}</p>}
                  {msg.image_url && (
                    <img src={msg.image_url} alt="attachment"
                      style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '6px', cursor: 'pointer' }}
                      onClick={() => window.open(msg.image_url, '_blank')} />
                  )}
                  <p style={{
                    fontSize: '10px', marginTop: '4px', textAlign: 'right',
                    color: isMe ? 'rgba(255,248,242,0.65)' : mutedColor,
                  }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ borderTop: `1px solid ${borderColor}`, padding: '12px 16px', background: cardBg }}>
          {image && (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
              <img src={URL.createObjectURL(image)} alt="preview" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${borderColor}` }} />
              <button type="button" onClick={() => setImage(null)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#CC4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
            </div>
          )}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '18px', cursor: 'pointer', padding: '4px', flexShrink: 0, opacity: 0.6 }}>
              📎
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ display: 'none' }} />
            </label>
            <input
              type="text" value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1, padding: '9px 14px', borderRadius: '20px',
                border: `1px solid ${borderColor}`,
                fontSize: '14px', outline: 'none',
                backgroundColor: inputBg, color: textColor,
              }}
            />
            <button
              type="submit" disabled={loading}
              style={{
                backgroundColor: loading ? '#C4733A' : '#D4845A',
                color: '#FFF8F2', border: 'none', borderRadius: '20px',
                padding: '9px 18px', fontSize: '14px', fontWeight: '500',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;