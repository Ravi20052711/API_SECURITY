import React, { useState, useEffect } from 'react';
import { Bot, X, Send, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Award } from 'lucide-react';
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
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Reset & Load Fresh Adaptive AI Session Every Time Dashboard Opens
  const handleOpenDashboard = () => {
    setIsOpen(true);
    setChatMessages([]); // Fresh session reset
    setLoading(true);

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
      .catch(() => {
        setGreeting("Welcome back! Your Qwen AI Assistant is ready with personalized learning recommendations.");
      })
      .finally(() => setLoading(false));
  };

  const handleCloseDashboard = () => {
    setIsOpen(false);
    setChatMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    
    const updatedMessages = [...chatMessages, { role: 'user', text: userText }];
    setChatMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await aiApi.sendMessage(userText);
      if (res && res.reply) {
        setChatMessages([...updatedMessages, { role: 'assistant', text: res.reply }]);
      } else {
        setChatMessages([...updatedMessages, { role: 'assistant', text: 'Local Qwen AI service responded.' }]);
      }
    } catch {
      setChatMessages([...updatedMessages, { role: 'assistant', text: 'Local Qwen AI Assistant is currently offline. Your progress records and lab exercises remain unaffected.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. SMALL FLOATING AI BUTTON (BOTTOM-LEFT CORNER) */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9990,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <button
          onClick={handleOpenDashboard}
          title="Open Local Qwen AI Learning Assistant"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--brand-navy)',
            color: '#ff9800',
            border: '2px solid #ff9800',
            boxShadow: '0 8px 24px rgba(27, 20, 100, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, boxShadow 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={26} color="#ff9800" />
        </button>

        <div style={{
          background: 'var(--brand-navy)',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11.5px',
          fontWeight: '700',
          border: '1px solid rgba(255,152,0,0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer'
        }} onClick={handleOpenDashboard}>
          <Sparkles size={13} color="#ff9800" />
          <span>Qwen AI Assistant</span>
        </div>
      </div>

      {/* 2. CENTERED DASHBOARD OVERLAY MODAL */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>

            {/* Header Bar with Experience Tier Badge */}
            <div style={{
              background: 'linear-gradient(135deg, #1b1464 0%, #0f172a 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #ff9800'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: '#ff9800', borderRadius: '8px', color: '#ffffff' }}>
                  <Bot size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontSize: '10px', color: '#ff9800', fontWeight: '800', letterSpacing: '1px' }}>
                      ADAPTIVE LAB TUTOR
                    </span>
                    <span style={{
                      background: 'rgba(255,152,0,0.2)',
                      color: '#ff9800',
                      border: '1px solid rgba(255,152,0,0.4)',
                      padding: '1px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '800'
                    }}>
                      {experienceLevel.badge}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                    Learning Assistant Dashboard
                  </h2>
                </div>
              </div>

              <button 
                onClick={handleCloseDashboard}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Close AI Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              
              {/* Adaptive Greeting Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px 20px',
                fontSize: '13.5px',
                lineHeight: '1.6',
                color: '#1e293b'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="mono" style={{ fontSize: '10px', color: '#ff9800', fontWeight: '800' }}>
                    // ADAPTIVE GREETING • {experienceLevel.title.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                    {experienceLevel.badge}
                  </span>
                </div>
                {loading && !greeting ? 'Analyzing experience level & generating greeting...' : greeting}
              </div>

              {/* Progress Summary & Recommended Step */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* Progress Summary Card */}
                <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <div className="mono" style={{ fontSize: '10px', color: '#1e40af', fontWeight: '800' }}>PROGRESS METRICS</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#1b1464', marginTop: '2px' }}>
                    {progressSummary.completion_rate}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600', marginTop: '2px' }}>
                    {progressSummary.completed_count} of {progressSummary.total_exercises} Exercises Completed
                  </div>
                </div>

                {/* Next Recommended Exercise Card */}
                <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <div className="mono" style={{ fontSize: '10px', color: '#b45309', fontWeight: '800' }}>RECOMMENDED NEXT STEP</div>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#78350f', marginTop: '4px' }}>
                    {progressSummary.next_recommendation}
                  </div>
                  <div style={{ fontSize: '11px', color: '#92400e', marginTop: '4px' }}>
                    Targeted OWASP vulnerability exercise
                  </div>
                </div>

              </div>

              {/* Interactive Chat Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <div className="mono" style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                  // INTERACTIVE ADAPTIVE AI CHAT ({experienceLevel.title.toUpperCase()} TIER)
                </div>

                {chatMessages.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: '12.5px', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px stroke #e2e8f0', textAlign: 'center' }}>
                    Ask Qwen AI for guidance. Explanations and hints are tailored to your <strong>{experienceLevel.title}</strong> experience level!
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        maxWidth: '88%',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.role === 'user' ? '#1b1464' : '#f1f5f9',
                        color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                        border: msg.role === 'user' ? '1px solid #3b0764' : '1px solid #cbd5e1'
                      }}
                    >
                      <div className="mono" style={{ fontSize: '10px', fontWeight: '800', marginBottom: '2px', color: msg.role === 'user' ? '#ff9800' : '#475569' }}>
                        {msg.role === 'user' ? 'You' : `Qwen AI (${experienceLevel.badge})`}
                      </div>
                      {msg.text}
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Chat Input Bar */}
            <form 
              onSubmit={handleSendMessage}
              style={{
                padding: '16px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '12px'
              }}
            >
              <input
                type="text"
                placeholder={`Ask Qwen AI a lab question (tailored for ${experienceLevel.title})...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'var(--brand-orange)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={15} /> {loading ? 'Thinking...' : 'Ask AI'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
