import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play, Square, Trash2, CheckCircle2, HelpCircle, FileText, Globe, Terminal, ShieldAlert, Monitor, ArrowRight, ExternalLink } from 'lucide-react';
import { exerciseApi, labApi, oracleApi } from '../services/api';

export default function ExercisePage({ navigate }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_profile') || localStorage.getItem('user');
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

    // Determine Host Dynamically
    const currentHost = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : 'localhost';

    // Call Backend to Load Challenge Config & Dedicated Container
    labApi.startLab(exId, currentUser?.email || 'student@lab.dev')
      .then(sess => {
        if (sess) {
          setSessionId(sess.sessionId);
          setSessionToken(sess.sessionToken);
          if (sess.challenge) setChallenge(sess.challenge);
          if (sess.port) {
            setAssignedPort(sess.port);
            setTargetUrl(`http://${currentHost}:${sess.port}`);
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
        labApi.getLabStatus(exerciseId)
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
        const res = await labApi.resumeLab(exerciseId);
        setIsPaused(false);
        if (res.remainingSeconds !== undefined) setRemainingSeconds(res.remainingSeconds);
      } catch {
        setIsPaused(false);
      }
    } else {
      try {
        const res = await labApi.pauseLab(exerciseId);
        setIsPaused(true);
        if (res.remainingSeconds !== undefined) setRemainingSeconds(res.remainingSeconds);
      } catch {
        setIsPaused(true);
      }
    }
  };

  // Stop Container (Save Progress & Return to Dashboard)
  const handleStopLab = async () => {
    try {
      await labApi.stopLab(exerciseId);
    } catch {}
    navigate('/dashboard');
  };

  // Delete Container (Wipe Container State & Return)
  const handleDeleteContainer = async () => {
    try {
      await labApi.stopLab(exerciseId);
    } catch {}
    navigate('/modules');
  };

  // Auto Submit on Timer Expiry
  const handleAutoSubmit = async () => {
    setIsExpired(true);
    try {
      const res = await exerciseApi.submitExercise(exerciseId, {
        method,
        endpoint,
        body: requestBody,
        auto_expired: true
      });
      setVerificationResult(res);
    } catch {
      setVerificationResult({
        verified: false,
        status: 'EXPIRED',
        message: 'Time limit expired (20:00). Container instance has been safely recycled.'
      });
    }
  };

  // Execute Live HTTP Request via Request Builder
  const handleSendRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseOutput('Executing request against target container...');

    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(requestBody);
      } catch {
        parsedBody = {};
      }

      const res = await exerciseApi.submitExercise(exerciseId, {
        method,
        endpoint,
        headers: requestHeaders,
        body: parsedBody
      });

      setResponseStatus(res.status_code || (res.verified ? 200 : 400));
      setResponseOutput(JSON.stringify(res.response_data || res, null, 2));

      if (res.verified) {
        setVerificationResult(res);
        setShowCompleteModal(true);
        exerciseApi.recordProgress(exerciseId, 'COMPLETED', 100);
      }
    } catch (err) {
      setResponseStatus(500);
      setResponseOutput(JSON.stringify({
        error: 'Target Container Execution Error',
        details: err.response?.data || err.message
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Manual Verification Submission
  const handleVerifyLab = async () => {
    setLoading(true);
    try {
      const res = await exerciseApi.submitExercise(exerciseId, {
        method,
        endpoint,
        headers: requestHeaders,
        body: JSON.parse(requestBody || '{}')
      });

      setVerificationResult(res);
      if (res.verified) {
        setShowCompleteModal(true);
        exerciseApi.recordProgress(exerciseId, 'COMPLETED', 100);
      }
    } catch (err) {
      setVerificationResult({
        verified: false,
        status: 'FAIL',
        message: 'Verification check failed. Ensure target user deletion or payload manipulation was executed cleanly.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#090d16', color: '#f8fafc', overflow: 'hidden' }}>
      
      {/* EXERCISE TOP CONTROL BAR */}
      <header style={{
        height: '56px',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '0 20px',
        flexShrink: 0
      }}>
        {/* Left Info & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="mono" style={{ background: '#ff9800', color: '#000000', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: '800' }}>
            &gt;_ {challenge.lab_id}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
              {challenge.title}
            </div>
            <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
              {challenge.owasp}
            </div>
          </div>
        </div>

        {/* Center Timer & Security Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: isPaused ? '#f59e0b' : '#0284c7',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '800'
          }} className="mono">
            <Clock size={16} />
            <span>TIME REMAINING {formatTimer(remainingSeconds)}</span>
          </div>

          <div style={{ background: '#059669', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }} className="mono">
            🛡️ FULLSCREEN MANDATORY
          </div>
        </div>

        {/* Right Session Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={handleTogglePause}
            className="tech-btn tech-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', background: '#1e293b', color: '#ffffff', border: '1px solid #334155' }}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button 
            onClick={() => setShowStopModal(true)}
            className="tech-btn tech-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', background: '#1e293b', color: '#ffffff', border: '1px solid #334155' }}
          >
            <Square size={14} />
            <span>Stop Lab</span>
          </button>

          <button 
            onClick={() => setShowDeleteModal(true)}
            className="tech-btn"
            style={{ padding: '6px 12px', fontSize: '12px', background: '#ef4444', color: '#ffffff', border: 'none' }}
          >
            <Trash2 size={14} />
            <span>Delete Container</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE NAVIGATION TAB BAR */}
      <div style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        padding: '0 20px',
        gap: '4px',
        flexShrink: 0
      }}>
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
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="tech-badge badge-amber">{challenge.owasp}</span>
                <span className="tech-badge badge-cyan">{challenge.difficulty}</span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '16px' }}>
                {challenge.title}
              </h2>

              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
                {challenge.problem_statement}
              </p>

              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                <h4 className="mono" style={{ fontSize: '12px', color: '#ff9800', fontWeight: '800', marginBottom: '8px' }}>
                  🎯 PRIMARY LAB OBJECTIVE:
                </h4>
                <p style={{ fontSize: '13px', color: '#f8fafc', lineHeight: '1.5' }}>
                  {challenge.objective}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #334155' }}>
                  <div className="mono" style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>TARGET CONTAINER URL</div>
                  <div className="mono" style={{ fontSize: '13px', color: '#4ade80', fontWeight: '700', marginTop: '4px' }}>{targetUrl}</div>
                </div>

                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #334155' }}>
                  <div className="mono" style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>YOUR SESSION CREDENTIALS</div>
                  <div className="mono" style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '700', marginTop: '4px' }}>
                    {challenge.authenticated_user} : {challenge.credentials?.password || 'peter'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="tech-btn tech-btn-amber" onClick={() => setActiveTab('target_app')}>
                  <span>Launch Vulnerable Web App &rarr;</span>
                </button>
                <button className="tech-btn tech-btn-secondary" style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #334155' }} onClick={() => setActiveTab('request_builder')}>
                  <span>Open HTTP Request Builder Workspace</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: VULNERABLE WEB APP EXPLORER & API SPEC WORKBENCH */}
        {activeTab === 'target_app' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            
            {/* Top Container Status Bar */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={16} style={{ color: '#38bdf8' }} />
                <span className="mono" style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>TARGET SERVICE PORT:</span>
                <span className="mono" style={{ fontSize: '12px', color: '#4ade80', fontWeight: '700' }}>:{assignedPort} ({challenge.owasp})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: '700', background: 'rgba(74, 222, 128, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                  🟢 Live Container Active
                </span>
              </div>
            </div>

            {/* Container Explorer Area */}
            <div style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '450px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
                    🌐 Vulnerable Web App - OpenAPI & Endpoint Console
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Inspect active endpoints, payloads, and target parameters for challenge <strong>{challenge.lab_id}</strong>
                  </p>
                </div>
                
                <button className="tech-btn tech-btn-amber" onClick={() => setActiveTab('request_builder')}>
                  <span>Open Request Builder &rarr;</span>
                </button>
              </div>

              {/* Endpoint Spec Card */}
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
                <div className="mono" style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', marginBottom: '12px' }}>
                  // DISCOVERED API ENDPOINTS FOR THIS LAB ({challenge.owasp})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="tech-badge badge-green" style={{ fontSize: '10px' }}>GET</span>
                      <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/users/me</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Returns authenticated user profile</span>
                  </div>

                  {exerciseId === 'ex-bfla-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-red" style={{ fontSize: '10px' }}>DELETE</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/users/carlos</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('DELETE');
                          setEndpoint('/api/v1/users/carlos');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-bola-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-amber" style={{ fontSize: '10px' }}>GET</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/invoices/INV-888</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('GET');
                          setEndpoint('/api/v1/invoices/INV-888');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-mass-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-amber" style={{ fontSize: '10px' }}>PATCH</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/users/profile</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('PATCH');
                          setEndpoint('/api/v1/users/profile');
                          setRequestBody('{\n  "role": "administrator"\n}');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-ssrf-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-red" style={{ fontSize: '10px' }}>GET</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/fetch?url=http://169.254.169.254</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('GET');
                          setEndpoint('/api/v1/fetch?url=http://169.254.169.254');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-sqli-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-red" style={{ fontSize: '10px' }}>GET</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/users/search?q=' OR '1'='1</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('GET');
                          setEndpoint("/api/v1/users/search?q=' OR '1'='1");
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-cors-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-amber" style={{ fontSize: '10px' }}>GET</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/user/sensitive-token</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('GET');
                          setEndpoint('/api/v1/user/sensitive-token');
                          setRequestHeaders('Origin: https://attacker.com\nContent-Type: application/json');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-cmdi-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-red" style={{ fontSize: '10px' }}>POST</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/export/pdf</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('POST');
                          setEndpoint('/api/v1/export/pdf');
                          setRequestBody('{\n  "filename": "report.pdf; cat /etc/passwd"\n}');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-xxe-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-red" style={{ fontSize: '10px' }}>POST</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/xml/parse</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('POST');
                          setEndpoint('/api/v1/xml/parse');
                          setRequestBody('<?xml version="1.0"?>\n<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>\n<foo>&xxe;</foo>');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-nosql-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-amber" style={{ fontSize: '10px' }}>POST</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/api/v1/auth/login</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('POST');
                          setEndpoint('/api/v1/auth/login');
                          setRequestBody('{\n  "username": "admin",\n  "password": {"$ne": null}\n}');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                  {exerciseId === 'ex-graphql-01' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ef4444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="tech-badge badge-green" style={{ fontSize: '10px' }}>POST</span>
                        <span className="mono" style={{ fontSize: '12px', color: '#f8fafc' }}>/graphql</span>
                      </div>
                      <button 
                        className="tech-btn tech-btn-amber tech-btn-sm" 
                        onClick={() => {
                          setMethod('POST');
                          setEndpoint('/graphql');
                          setRequestBody('{\n  "query": "{ __schema { types { name } } }"\n}');
                          setActiveTab('request_builder');
                        }}
                      >
                        Load Payload into Builder &rarr;
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Target User Session Details */}
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px' }}>
                <div className="mono" style={{ fontSize: '11px', color: '#4ade80', fontWeight: '700', marginBottom: '8px' }}>
                  // TARGET USER CREDENTIALS & TOKEN CONTEXT
                </div>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                  Logged in as <strong>{challenge.authenticated_user}</strong> (Role: Standard User). Target object parameter: <strong>{challenge.target_user}</strong>.
                </p>
              </div>

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

            {/* Right: Response Output Panel */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="mono" style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>
                  &gt;_ TARGET CONTAINER HTTP RESPONSE
                </div>
                {responseStatus && (
                  <div className="mono" style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: responseStatus === 200 ? '#059669' : '#dc2626',
                    color: '#ffffff'
                  }}>
                    STATUS: {responseStatus}
                  </div>
                )}
              </div>

              <pre className="mono" style={{
                flex: 1,
                background: '#090d16',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '16px',
                color: responseStatus === 200 ? '#34d399' : '#f8fafc',
                fontSize: '12px',
                lineHeight: '1.5',
                overflow: 'auto',
                margin: 0
              }}>
                {responseOutput}
              </pre>

              {/* Server-Side Verification Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Ready to test server-side objective state?
                </div>
                <button className="tech-btn tech-btn-amber" onClick={handleVerifyLab} disabled={loading}>
                  <span>Validate Lab Objective &rarr;</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SERVER-SIDE VERIFICATION & ORACLE REPORT */}
        {activeTab === 'verification' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '32px' }}>
              <div className="mono" style={{ fontSize: '12px', color: '#ff9800', fontWeight: '700', marginBottom: '12px' }}>
                // SERVER-SIDE INDEPENDENT ORACLE EVALUATION
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>
                Automated Exploitation Verification
              </h3>

              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
                The Oracle engine independently verifies your container state against objective criteria ({challenge.objective}).
              </p>

              {verificationResult ? (
                <div style={{
                  padding: '20px',
                  borderRadius: '8px',
                  background: verificationResult.verified ? 'rgba(5, 150, 105, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                  border: `1px solid ${verificationResult.verified ? '#059669' : '#dc2626'}`,
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '800', color: verificationResult.verified ? '#34d399' : '#f87171', marginBottom: '8px' }}>
                    <CheckCircle2 size={20} />
                    <span>{verificationResult.verified ? 'VERIFICATION PASSED - 100/100 SCORE RECORDED!' : 'VERIFICATION FAILED'}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#f8fafc', lineHeight: '1.5' }}>
                    {verificationResult.message || (verificationResult.verified ? 'Objective met successfully.' : 'Check target user state.')}
                  </p>
                </div>
              ) : (
                <div style={{ background: '#0f172a', border: '1px solid #334155', padding: '20px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                  No verification submission evaluated yet. Execute a request via Request Builder and click Validate.
                </div>
              )}

              <button className="tech-btn tech-btn-amber" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleVerifyLab} disabled={loading}>
                <span>{loading ? 'Evaluating Target State...' : 'Run Server-Side Verification Check'}</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* STOP LAB MODAL */}
      {showStopModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '28px', maxWidth: '440px', width: '100%', color: '#ffffff' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Stop Lab Instance?</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '24px', lineHeight: '1.5' }}>
              Stopping the lab will save your current progress and safely recycle container resources. You can resume anytime.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-secondary" style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #334155' }} onClick={() => setShowStopModal(false)}>Cancel</button>
              <button className="tech-btn tech-btn-amber" onClick={handleStopLab}>Stop & Return to Dashboard</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONTAINER MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '12px', padding: '28px', maxWidth: '440px', width: '100%', color: '#ffffff' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#f87171', marginBottom: '12px' }}>Delete Lab Container?</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '24px', lineHeight: '1.5' }}>
              This will destroy the active Docker container instance and clear your transient session state.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-secondary" style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #334155' }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="tech-btn" style={{ background: '#ef4444', color: '#ffffff', border: 'none' }} onClick={handleDeleteContainer}>Delete Container Instance</button>
            </div>
          </div>
        </div>
      )}

      {/* LAB COMPLETED MODAL */}
      {showCompleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '2px solid #059669', borderRadius: '16px', padding: '36px', maxWidth: '500px', width: '100%', color: '#ffffff', textAlign: 'center' }}>
            <div style={{ background: '#059669', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ffffff' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', marginBottom: '8px' }}>LAB COMPLETED!</h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '24px' }}>
              Congratulations! You successfully exploited <strong>{challenge.title}</strong> (100/100 points).
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="tech-btn tech-btn-secondary" style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #334155' }} onClick={() => setShowCompleteModal(false)}>Review Workspace</button>
              <button className="tech-btn tech-btn-amber" onClick={() => navigate('/dashboard')}>Return to Dashboard &rarr;</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
