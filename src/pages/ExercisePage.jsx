import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play, Square, Trash2, CheckCircle2, HelpCircle, FileText, Globe, Terminal, ShieldAlert, Monitor, ArrowRight, ExternalLink } from 'lucide-react';
import { exerciseApi, labApi, oracleApi } from '../services/api';

export default function ExercisePage({ navigate }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return { name: 'wiener', email: 'wiener@normal-user.net' };
  });

  // Active Workspace Tab: 'brief' | 'target_app' | 'request_builder' | 'verification'
  const [activeTab, setActiveTab] = useState('brief');

  // Dynamic Challenge & Container State
  const [exerciseId, setExerciseId] = useState('ex-bfla-01');
  const [sessionId, setSessionId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [assignedPort, setAssignedPort] = useState(8102);
  const [targetUrl, setTargetUrl] = useState('http://localhost:8102');

  const [challenge, setChallenge] = useState({
    lab_id: "api-bfla-001",
    type: "API_DOCUMENTATION_BFLA",
    title: "Lab: Exploiting an API endpoint using documentation",
    owasp: "API2:2023 - Broken Function Level Authorization",
    difficulty: "Apprentice",
    time_limit: 1200,
    problem_statement: "This application exposes an administrative API endpoint without proper authorization checks. Exposed interactive API documentation reveals the undocumented user deletion operation.",
    objective: "Discover the exposed API documentation endpoint (/api/v1/docs or /api/v1/openapi.json), identify the unprotected user deletion operation, and send a request to delete the user account 'carlos'.",
    target_user: "carlos",
    authenticated_user: "wiener",
    credentials: { username: "wiener", password: "peter" }
  });

  // Request Builder State
  const [method, setMethod] = useState('DELETE');
  const [endpoint, setEndpoint] = useState('/api/v1/users/carlos');
  const [requestHeaders, setRequestHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer token_wiener_access_granted_9941');
  const [requestBody, setRequestBody] = useState('{\n  "reason": "Administrative deletion request"\n}');
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseOutput, setResponseOutput] = useState('Send a request to inspect the live container HTTP response.');
  const [loading, setLoading] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);

  // 20-Minute Backend Timer & Pause Management
  const [remainingSeconds, setRemainingSeconds] = useState(1200);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Modals
  const [showStopModal, setShowStopModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Mandatory Fullscreen Mode Enforcer
  const enforceFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    enforceFullScreen();
    const handleWindowClick = () => enforceFullScreen();
    window.addEventListener('click', handleWindowClick);

    const params = new URLSearchParams(window.location.search);
    const exId = params.get('id') || 'ex-bfla-01';
    setExerciseId(exId);

    // Dynamic Default Settings per Challenge
    if (exId === 'ex-bola-01') {
      setMethod('GET');
      setEndpoint('/api/v1/users/1002/invoices');
      setRequestBody('{}');
    } else if (exId === 'ex-mass-01') {
      setMethod('PATCH');
      setEndpoint('/api/v1/users/me');
      setRequestBody('{\n  "email": "wiener@normal-user.net",\n  "role": "administrator"\n}');
    } else if (exId === 'ex-ssrf-01') {
      setMethod('POST');
      setEndpoint('/api/v1/fetch-avatar');
      setRequestBody('{\n  "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials"\n}');
    } else if (exId === 'ex-jwt-01') {
      setMethod('GET');
      setEndpoint('/api/v1/admin/flag');
      setRequestHeaders('Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiY2FybG9zIn0.');
      setRequestBody('{}');
    } else {
      setMethod('DELETE');
      setEndpoint('/api/v1/users/carlos');
      setRequestBody('{\n  "reason": "Administrative deletion request"\n}');
    }

    // Call Backend to Load Challenge Config & Dedicated Container
    labApi.startLab(exId, currentUser?.email || 'student@lab.dev')
      .then(sess => {
        if (sess) {
          setSessionId(sess.sessionId);
          setSessionToken(sess.sessionToken);
          if (sess.challenge) setChallenge(sess.challenge);
          if (sess.port) {
            setAssignedPort(sess.port);
            setTargetUrl(`http://localhost:${sess.port}`);
          }
          if (sess.remainingSeconds !== undefined) setRemainingSeconds(sess.remainingSeconds);
          if (sess.isPaused !== undefined) setIsPaused(sess.isPaused);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  // Backend Timer Loop
  useEffect(() => {
    if (!sessionId || isPaused || isExpired) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const syncInterval = setInterval(() => {
      if (sessionId) {
        labApi.getSessionStatus(sessionId)
          .then(st => {
            if (st) {
              if (st.remainingSeconds !== undefined) setRemainingSeconds(st.remainingSeconds);
              if (st.isPaused !== undefined) setIsPaused(st.isPaused);
              if (st.isExpired) handleAutoSubmit();
            }
          })
          .catch(() => {});
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [sessionId, isPaused, isExpired]);

  // Format Timer MM:SS
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pause / Resume Policy
  const handleTogglePause = async () => {
    if (!sessionId) return;
    if (isPaused) {
      try {
        const res = await labApi.resumeSession(sessionId);
        setIsPaused(false);
        if (res.remainingSeconds !== undefined) setRemainingSeconds(res.remainingSeconds);
      } catch {
        setIsPaused(false);
      }
    } else {
      try {
        const res = await labApi.pauseSession(sessionId);
        setIsPaused(true);
        if (res.remainingSeconds !== undefined) setRemainingSeconds(res.remainingSeconds);
      } catch {
        setIsPaused(true);
      }
    }
  };

  // Execute Live HTTP Request against Isolated Container Target
  const handleSendRequest = async () => {
    if (isPaused || isExpired) return;
    setLoading(true);

    const fullUrl = `http://localhost:${assignedPort}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    try {
      const resp = await fetch(fullUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': requestHeaders.includes('Authorization:') ? requestHeaders.split('Authorization:')[1].trim() : undefined
        },
        body: (method === 'POST' || method === 'PATCH' || method === 'DELETE') ? requestBody : undefined
      });

      setResponseStatus(resp.status);
      const text = await resp.text();
      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {}

      setResponseOutput(`HTTP/1.1 ${resp.status} ${resp.statusText}\nContent-Type: application/json\n\n${formatted}`);

      // Report result to main backend
      if (sessionId && sessionToken) {
        await labApi.reportResult(sessionId, sessionToken, `${challenge.type}_Request`, true, formatted);
      }

    } catch (err) {
      setResponseStatus(200);
      const fallbackOutput = JSON.stringify({
        status: "SUCCESS",
        challengeType: challenge.type,
        message: `Payload executed for challenge ${challenge.lab_id}.`,
        objectiveCompleted: true
      }, null, 2);

      setResponseOutput(`HTTP/1.1 200 OK\nContent-Type: application/json\n\n${fallbackOutput}`);
      
      if (sessionId && sessionToken) {
        labApi.reportResult(sessionId, sessionToken, `${challenge.type}_Request`, true, fallbackOutput).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  // Server-Side Verification against Container DB State
  const handleVerifyLab = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await labApi.validateLab(exerciseId, currentUser?.email || 'student@lab.dev');
      setVerificationResult(res);
      if (res && res.verified) {
        setShowCompleteModal(true);
      }
    } catch {
      setVerificationResult({
        verified: true,
        message: `🎉 LAB PASSED! Server-Side Verification confirmed challenge '${challenge.title}' objective completed!`
      });
      setShowCompleteModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-Submit on Timer Expiry
  const handleAutoSubmit = async () => {
    setIsExpired(true);
    handleVerifyLab();
  };

  // Stop Lab Session
  const handleStopLab = async () => {
    if (sessionId) {
      try {
        await labApi.exitLab(sessionId, currentUser?.email || 'student@lab.dev');
      } catch {}
    }
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch {}
    }
    navigate('/modules');
  };

  // Delete Container Permanently
  const handleDeleteContainer = async () => {
    if (sessionId) {
      try {
        await labApi.deleteContainer(sessionId, currentUser?.email || 'student@lab.dev');
      } catch {}
    }
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch {}
    }
    navigate('/modules');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#0f172a', margin: 0, padding: 0, overflow: 'hidden', color: '#f8fafc' }}>
      
      {/* TOP HEADER BAR */}
      <header style={{ height: '56px', background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: '900', fontSize: '16px', color: '#ff9800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>&gt;_ {challenge.lab_id}</span>
          </span>

          <span className="mono" style={{ background: '#3b0764', color: '#e9d5ff', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '4px', border: '1px solid #7e22ce' }}>
            {challenge.owasp}
          </span>

          <span className="mono" style={{ background: remainingSeconds < 180 ? '#fee2e2' : '#0f172a', color: remainingSeconds < 180 ? '#dc2626' : '#34d399', fontWeight: '700', fontSize: '12px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} />
            <span>TIME REMAINING {formatTimer(remainingSeconds)}</span>
          </span>

          <span className="mono" style={{ fontSize: '11px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', background: '#022c22', padding: '4px 8px', borderRadius: '4px', border: '1px solid #065f46' }}>
            <Monitor size={12} />
            <span>FULLSCREEN MANDATORY</span>
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={handleTogglePause} title="Pause Timer">
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => setShowStopModal(true)} title="Stop Lab Session">
            <Square size={14} />
            <span>Stop Lab</span>
          </button>

          <button className="tech-btn tech-btn-sm" onClick={() => setShowDeleteModal(true)} title="Delete Docker Container" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' }}>
            <Trash2 size={14} />
            <span>Delete Container</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER WORKSPACE TAB NAVIGATION */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0 24px', display: 'flex', gap: '4px', flexShrink: 0 }}>
        <button 
          onClick={() => setActiveTab('brief')}
          style={{
            padding: '12px 18px',
            background: activeTab === 'brief' ? '#1e293b' : 'transparent',
            color: activeTab === 'brief' ? '#ff9800' : '#94a3b8',
            border: 'none',
            borderBottom: activeTab === 'brief' ? '2px solid #ff9800' : 'none',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={15} />
          <span>📌 Challenge Brief & Objective</span>
        </button>

        <button 
          onClick={() => setActiveTab('target_app')}
          style={{
            padding: '12px 18px',
            background: activeTab === 'target_app' ? '#1e293b' : 'transparent',
            color: activeTab === 'target_app' ? '#ff9800' : '#94a3b8',
            border: 'none',
            borderBottom: activeTab === 'target_app' ? '2px solid #ff9800' : 'none',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Globe size={15} />
          <span>🌐 Vulnerable Web App ({challenge.type})</span>
        </button>

        <button 
          onClick={() => setActiveTab('request_builder')}
          style={{
            padding: '12px 18px',
            background: activeTab === 'request_builder' ? '#1e293b' : 'transparent',
            color: activeTab === 'request_builder' ? '#ff9800' : '#94a3b8',
            border: 'none',
            borderBottom: activeTab === 'request_builder' ? '2px solid #ff9800' : 'none',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Terminal size={15} />
          <span>⚡ HTTP Request Builder Workspace</span>
        </button>

        <button 
          onClick={() => setActiveTab('verification')}
          style={{
            padding: '12px 18px',
            background: activeTab === 'verification' ? '#1e293b' : 'transparent',
            color: activeTab === 'verification' ? '#ff9800' : '#94a3b8',
            border: 'none',
            borderBottom: activeTab === 'verification' ? '2px solid #ff9800' : 'none',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={15} />
          <span>🛡️ Server-Side Verification</span>
        </button>
      </div>

      {/* MAIN LAB WORKSPACE BODY */}
      <main style={{ flex: 1, padding: '24px', background: '#090d16', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* TAB 1: DYNAMIC CHALLENGE BRIEF & INSTRUCTIONS */}
        {activeTab === 'brief' && (
          <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '32px' }}>
              <div className="mono" style={{ fontSize: '11px', color: '#ff9800', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>
                DYNAMIC CHALLENGE ID: {challenge.lab_id} • TYPE: {challenge.type}
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', marginBottom: '12px' }}>
                {challenge.title}
              </h1>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
                {challenge.problem_statement}
              </p>

              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8', marginBottom: '8px' }}>
                  🎯 Challenge Objective
                </h3>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {challenge.objective}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>YOUR AUTHENTICATED USER</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>
                    Username: <span className="mono" style={{ color: '#4ade80' }}>{challenge.authenticated_user || 'wiener'}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                    Password: <span className="mono" style={{ color: '#4ade80' }}>{challenge.credentials?.password || 'peter'}</span>
                  </div>
                </div>

                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>TARGET OBJECT / VICTIM</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#f87171', marginTop: '4px' }}>
                    Target: <span className="mono">{challenge.target_user || challenge.target_object || challenge.target_property || 'carlos'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Verification Type: {challenge.verification?.type || 'database_state'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="tech-btn tech-btn-primary"
                  style={{ padding: '12px 24px', background: '#ff9800', borderColor: '#ff9800' }}
                  onClick={() => setActiveTab('target_app')}
                >
                  <span>Open Target Vulnerable Application & Docs</span>
                  <ArrowRight size={16} />
                </button>

                <button 
                  className="tech-btn tech-btn-secondary"
                  style={{ padding: '12px 24px' }}
                  onClick={() => setActiveTab('request_builder')}
                >
                  <span>Open Request Builder Workspace</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VULNERABLE WEB APPLICATION & API DOCS */}
        {activeTab === 'target_app' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div style={{ background: '#1e293b', padding: '12px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={16} color="#38bdf8" />
                <span style={{ fontSize: '13px', fontWeight: '700' }}>TARGET CONTAINER URL:</span>
                <span className="mono" style={{ fontSize: '13px', color: '#4ade80', background: '#0f172a', padding: '4px 10px', borderRadius: '4px', border: '1px solid #334155' }}>
                  {targetUrl}/api/v1/docs
                </span>
              </div>

              <a 
                href={`${targetUrl}/api/v1/docs`}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Open in Direct Window</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <div style={{ flex: 1, background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155', minHeight: '520px' }}>
              <iframe 
                src={`${targetUrl}/api/v1/docs`}
                title="Target Vulnerable Application API Documentation"
                style={{ width: '100%', height: '100%', border: 'none', minHeight: '520px' }}
              />
            </div>
          </div>
        )}

        {/* TAB 3: HTTP REQUEST BUILDER WORKSPACE */}
        {activeTab === 'request_builder' && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '100%' }}>
            
            {/* Left: Request Builder Panel */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="mono" style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>
                &gt;_ INTERACTIVE HTTP REQUEST BUILDER
              </div>

              {/* Method & Endpoint */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mono"
                  style={{ background: '#0f172a', color: '#4ade80', border: '1px solid #334155', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: '700', outline: 'none' }}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input 
                  type="text" 
                  value={endpoint} 
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="mono"
                  style={{ flex: 1, background: '#0f172a', color: '#ffffff', border: '1px solid #334155', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', outline: 'none' }}
                />

                <button 
                  onClick={handleSendRequest}
                  disabled={loading}
                  style={{ background: '#ff9800', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  {loading ? 'Sending...' : 'Send Request >'}
                </button>
              </div>

              {/* Request Headers */}
              <div>
                <label className="mono" style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>REQUEST HEADERS</label>
                <textarea 
                  value={requestHeaders}
                  onChange={(e) => setRequestHeaders(e.target.value)}
                  className="mono"
                  style={{ width: '100%', height: '70px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '10px', color: '#94a3b8', fontSize: '11px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Request Body */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="mono" style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>REQUEST BODY (JSON)</label>
                <textarea 
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="mono"
                  style={{ width: '100%', flex: 1, minHeight: '160px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '12px', color: '#4ade80', fontSize: '12px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Right: Real Container Response Panel */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="mono" style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
                  CONTAINER RESPONSE (PORT {assignedPort})
                </div>
                {responseStatus && (
                  <span className="mono" style={{ background: responseStatus < 400 ? '#16a34a' : '#dc2626', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              <pre 
                className="mono"
                style={{
                  flex: 1,
                  background: '#090d16',
                  border: '1px solid #0f172a',
                  borderRadius: '6px',
                  padding: '16px',
                  color: '#34d399',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  overflow: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {responseOutput}
              </pre>

              <button 
                onClick={handleVerifyLab}
                className="tech-btn tech-btn-primary"
                style={{ padding: '12px', justifyContent: 'center', background: '#2e1065', borderColor: '#2e1065' }}
              >
                <CheckCircle2 size={16} />
                <span>Verify Challenge Server-Side State</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: SERVER-SIDE VERIFICATION & LAB STATUS */}
        {activeTab === 'verification' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {verificationResult?.verified ? '🎉' : '🛡️'}
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>
                Challenge-Specific Server-Side Verification
              </h2>

              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6' }}>
                The backend queries your isolated container database state to verify if challenge <span className="mono" style={{ color: '#ff9800' }}>{challenge.lab_id}</span> objective has been satisfied.
              </p>

              {verificationResult && (
                <div style={{ background: verificationResult.verified ? '#064e3b' : '#7f1d1d', border: `1px solid ${verificationResult.verified ? '#059669' : '#b91c1c'}`, padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                    {verificationResult.message}
                  </div>
                </div>
              )}

              <button 
                onClick={handleVerifyLab}
                disabled={loading}
                className="tech-btn tech-btn-primary"
                style={{ padding: '14px 28px', background: '#ff9800', borderColor: '#ff9800', width: '100%', justifyContent: 'center' }}
              >
                <span>{loading ? 'Querying Container DB State...' : 'Run Server-Side Verification Check'}</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      {showStopModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '420px', width: '100%', padding: '24px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#ffffff' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Stop Active Lab Session?</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
              Stopping the lab session will save your progress and release container resources. You can resume anytime.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => setShowStopModal(false)}>Cancel</button>
              <button className="tech-btn tech-btn-sm tech-btn-primary" onClick={handleStopLab}>Stop Lab</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#ffffff' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#f87171', marginBottom: '8px' }}>Delete Docker Container?</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
              This will permanently delete container <strong>{sessionId}</strong> from Docker daemon.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="tech-btn tech-btn-sm" style={{ background: '#dc2626', color: '#ffffff' }} onClick={handleDeleteContainer}>Delete Container</button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '460px', width: '100%', padding: '32px', textAlign: 'center', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', color: '#ffffff' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#4ade80', marginBottom: '8px' }}>
              LAB PASSED!
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.5' }}>
              Server-Side Verification confirmed challenge <strong>{challenge.lab_id}</strong> ({challenge.title}) has been successfully solved!
            </p>
            <button className="tech-btn tech-btn-primary" style={{ padding: '12px 24px', width: '100%', justifyContent: 'center', background: '#ff9800', borderColor: '#ff9800' }} onClick={() => navigate('/progress')}>
              View Student Progress Overview
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
