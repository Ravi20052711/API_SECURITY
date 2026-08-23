import React, { useState, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { aiApi, exerciseApi } from '../services/api';

export default function QwenFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [progressSummary, setProgressSummary] = useState({
    completed_count: 0,
    total_exercises: 5,
    completion_rate: 0,
    total_score: 0,
    next_recommendation: 'Broken Function Level Authorization (BFLA)'
  });

  const [experienceLevel, setExperienceLevel] = useState({
    tier: 'APPRENTICE',
    title: 'Beginner Apprentice',
    badge: '🌱 Apprentice',
    style: 'Step-by-step mentor guidance'
  });

  const [greeting, setGreeting] = useState('');
  const [greetingLoading, setGreetingLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Dynamic Flexible Page Reflow Effect when AI Sidebar Opens
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('ai-sidebar-open');
    } else {
      document.body.classList.remove('ai-sidebar-open');
    }
    return () => {
      document.body.classList.remove('ai-sidebar-open');
    };
  }, [isOpen]);

  // Reset & Load Fresh Adaptive AI Session Every Time Sidebar Opens
  const handleOpenDashboard = () => {
    setIsOpen(true);
    setChatMessages([]);
    setGreetingLoading(true);

    setGreeting("Welcome back! Your Qwen AI Assistant is ready with personalized learning recommendations.");

    exerciseApi.getDashboardMe()
      .then(data => {
        if (data) {
          if (data.user) setUserProfile(data.user);
          const items = data.progress_items || [];
          const notStarted = items.filter(i => i.status === 'NOT_STARTED');
          const inProg = items.filter(i => i.status === 'IN_PROGRESS');
          const nextRec = notStarted.length > 0 ? notStarted[0].title : (inProg.length > 0 ? inProg[0].title : 'Unfamiliar API Assessment');

          setProgressSummary({
            completed_count: data.stats?.completed_count || 0,
            total_exercises: data.stats?.total_exercises || 5,
            completion_rate: data.stats?.completion_rate || 0,
            total_score: data.stats?.total_score || 0,
            next_recommendation: nextRec
          });
        }
      })
      .catch(() => {});

    aiApi.getGreeting()
      .then(res => {
        if (res) {
          if (res.greeting) setGreeting(res.greeting);
          if (res.experience_level) setExperienceLevel(res.experience_level);
        }
      })
      .catch(() => {})
      .finally(() => setGreetingLoading(false));
  };

  const handleCloseDashboard = () => {
    setIsOpen(false);
    setChatMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    
    const updatedMessages = [...chatMessages, { role: 'user', text: userText }];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const res = await aiApi.sendMessage(userText);
      if (res && res.reply) {
        setChatMessages([...updatedMessages, { role: 'assistant', text: res.reply }]);
      } else {
        setChatMessages([...updatedMessages, { role: 'assistant', text: 'Local Qwen AI service responded.' }]);
      }
    } catch {
      setChatMessages([...updatedMessages, { role: 'assistant', text: 'Here is your quick hint: Open the Request Builder tab, inspect the API endpoint parameters, and test authorization boundaries.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      {/* 1. SMALL FLOATING AI BUTTON (BOTTOM-LEFT CORNER) */}
      {!isOpen && (
        <div 
          onClick={handleOpenDashboard}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, var(--brand-navy) 0%, #0f172a 100%)',
            border: '1.5px solid var(--brand-orange)',
            borderRadius: '50px',
            padding: '10px 18px',
            boxShadow: '0 8px 24px rgba(27, 20, 100, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            color: '#ffffff',
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bot size={22} style={{ color: 'var(--brand-orange)' }} />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="mono" style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
              &gt;_ Qwen AI
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>
              {experienceLevel.badge}
            </span>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC RESPONSIVE AI LEARNING ASSISTANT SIDEBAR PANEL */}
      {isOpen && (
        <aside style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '420px',
          maxWidth: '100vw',
          height: '100vh',
          background: '#ffffff',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.2)',
          borderLeft: '2px solid var(--brand-orange)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* Panel Header (TOP-LEFT CLOSE BUTTON & CLEAN BRANDING) */}
          <div style={{
            background: 'linear-gradient(135deg, var(--brand-navy) 0%, #0f0c36 100%)',
            padding: '14px 18px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            borderBottom: '2px solid var(--brand-orange)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              
              {/* TOP-LEFT (LEFT UPPER) CLOSE BUTTON */}
              <button 
                onClick={handleCloseDashboard}
                title="Close Assistant Sidebar"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              >
                <X size={16} />
              </button>

              <div style={{ background: 'var(--brand-orange)', padding: '7px', borderRadius: '8px', color: '#ffffff', display: 'flex', alignItems: 'center' }}>
                <Bot size={18} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    Qwen AI Assistant
                  </span>
                  <span className="tech-badge badge-amber" style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {experienceLevel.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  Learning Assistant Sidebar
                </h3>
              </div>
            </div>
          </div>

          {/* Panel Body (Scrollable Content) */}
          <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, background: '#f8fafc' }}>
            
            {/* Adaptive Greeting Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="mono" style={{ fontSize: '10px', color: 'var(--brand-orange)', fontWeight: '800' }}>
                  // ADAPTIVE GREETING
                </span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                  {experienceLevel.badge}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4', margin: 0 }}>
                {greetingLoading ? "Connecting to local Qwen AI..." : greeting}
              </p>
            </div>

            {/* Metrics & Recommendations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px' }}>
                <div className="mono" style={{ fontSize: '9px', color: '#1d4ed8', fontWeight: '800', marginBottom: '2px' }}>
                  PROGRESS METRICS
                </div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e40af' }}>
                  {progressSummary.completion_rate}%
                </div>
                <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '600' }}>
                  {progressSummary.completed_count}/{progressSummary.total_exercises} Exercises Done
                </div>
              </div>

              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '12px', borderRadius: '8px' }}>
                <div className="mono" style={{ fontSize: '9px', color: '#c2410c', fontWeight: '800', marginBottom: '2px' }}>
                  RECOMMENDED NEXT
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#9a3412', lineHeight: '1.3' }}>
                  {progressSummary.next_recommendation}
                </div>
              </div>
            </div>

            {/* Interactive Chat Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div className="mono" style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>
                // QWEN AI CHAT THREAD
              </div>

              {chatMessages.length === 0 ? (
                <div style={{ padding: '16px', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>
                  Ask Qwen AI for guidance while working on your lab. Explanations are tailored to your <strong>{experienceLevel.title}</strong> tier!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '90%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      lineHeight: '1.45',
                      background: msg.role === 'user' ? 'var(--brand-navy)' : '#ffffff',
                      color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                      border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                      {msg.role === 'assistant' && (
                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--brand-orange)', marginBottom: '3px' }}>
                          Qwen AI ({experienceLevel.badge})
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sticky Panel Input Footer */}
          <form onSubmit={handleSendMessage} style={{ padding: '12px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', flexShrink: 0 }}>
            <input 
              type="text"
              placeholder={`Ask Qwen AI a lab question...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={chatLoading}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              className="tech-btn tech-btn-amber"
              disabled={chatLoading}
              style={{ padding: '10px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              {chatLoading ? 'Thinking...' : 'Ask AI'}
              {!chatLoading && <Send size={13} />}
            </button>
          </form>

        </aside>
      )}
    </>
  );
}
