import React, { useState, useEffect } from 'react';
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
    badge: 'Apprentice',
    style: 'Step-by-step mentor guidance'
  });

  const [greeting, setGreeting] = useState('');
  const [greetingLoading, setGreetingLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

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

  const handleOpenDashboard = () => {
    setIsOpen(true);
    setChatMessages([]);
    setGreetingLoading(true);

    setGreeting("Qwen AI Assistant is ready with adaptive guidance for your active laboratory session.");

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
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newThread = [...chatMessages, { role: 'user', text: userText }];
    setChatMessages(newThread);
    setChatLoading(true);

    try {
      const activeState = window.__CURRENT_LAB_WORKBENCH_STATE__ || {};
      const res = await aiApi.chat({
        message: userText,
        thread: newThread,
        context: {
          exercise_id: activeState.exercise_id || 'general',
          lab_title: activeState.lab_title || 'General API Security Lab',
          owasp: activeState.owasp || 'OWASP API Security',
          scenario: activeState.scenario || '',
          objective: activeState.objective || '',
          active_tab: activeState.active_tab || 'dashboard',
          request_method: activeState.request_method,
          request_endpoint: activeState.request_endpoint,
          last_response_status: activeState.last_response_status,
          user_email: userProfile?.email || 'student@lab.dev',
          experience_level: experienceLevel.tier
        }
      });

      if (res && res.reply) {
        setChatMessages([...newThread, { role: 'assistant', text: res.reply }]);
      } else {
        setChatMessages([...newThread, { role: 'assistant', text: "Consider reviewing the parameter authorization logic in the target endpoint." }]);
      }
    } catch {
      setChatMessages([...newThread, { role: 'assistant', text: "AI guidance engine response timed out. Verify your target request payload." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={handleOpenDashboard}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
          aria-label="Open Qwen AI Assistant"
        >
          <span>Qwen AI Assistant</span>
        </button>
      )}

      {/* Floating Sidebar */}
      {isOpen && (
        <aside style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '380px',
          height: '100vh',
          backgroundColor: 'var(--bg-surface-1)',
          borderLeft: '1px solid var(--border-standard)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface-2)'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                Adaptive Learning Assistant
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Qwen2.5-Coder Engine
              </div>
            </div>
            <button
              onClick={handleCloseDashboard}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Close Assistant"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              backgroundColor: 'var(--bg-surface-3)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              {greetingLoading ? 'Connecting to local Qwen engine...' : greeting}
            </div>

            {/* Chat thread */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {chatMessages.length === 0 ? (
                <div style={{
                  padding: '24px 16px',
                  border: '1px dashed var(--border-standard)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  Ask questions about current laboratory objectives or parameter manipulation patterns.
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    lineHeight: '1.45',
                    backgroundColor: msg.role === 'user' ? 'var(--text-primary)' : 'var(--bg-surface-3)',
                    color: msg.role === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)'
                  }}>
                    {msg.text}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '8px'
          }}>
            <input 
              type="text"
              placeholder="Ask a technical lab question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={chatLoading}
              style={{ flex: 1, fontSize: '12px' }}
            />
            <button 
              type="submit" 
              className="tech-btn tech-btn-primary tech-btn-sm"
              disabled={chatLoading}
            >
              {chatLoading ? '...' : 'Ask'}
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
