import React, { useState, useEffect } from 'react';
import { exerciseApi, labApi, oracleApi } from '../services/api';

export default function ExercisePage({ navigate }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_profile') || localStorage.getItem('user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
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
  const [responseOutput, setResponseOutput] = useState('Execute a request to view live container HTTP telemetry.');
  const [loading, setLoading] = useState(false);

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
    window.__CURRENT_LAB_WORKBENCH_STATE__ = {
      exercise_id: exerciseId,
      lab_title: challenge?.title,
      owasp: challenge?.owasp,
      scenario: challenge?.problem_statement || challenge?.scenario,
      objective: challenge?.objective,
      active_tab: activeTab,
      request_method: method,
      request_endpoint: endpoint,
      request_headers: requestHeaders,
      request_body: requestBody,
      last_response_status: responseStatus,
      last_response_output: responseOutput
    };
  }, [exerciseId, challenge, activeTab, method, endpoint, requestHeaders, requestBody, responseStatus, responseOutput]);

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

    const currentHost = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : 'localhost';

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

  // Timer Loop
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

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  const handleStopLab = async () => {
    try {
      await labApi.stopLab(exerciseId);
    } catch {}
    navigate('/dashboard');
  };

  const handleDeleteContainer = async () => {
    try {
      await labApi.stopLab(exerciseId);
    } catch {}
    navigate('/modules');
  };

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
        message: 'Verification check failed. Ensure target state mutation was executed cleanly.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-canvas)',
      color: 'var(--text-primary)',
      overflow: 'hidden'
    }}>
      
      {/* Workbench Header */}
      <header style={{
        height: '52px',
        backgroundColor: 'var(--bg-surface-1)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0
      }}>
        {/* Left: Challenge Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            fontFamily: 'var(--font-mono)'
          }}>
            {challenge.lab_id}
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {challenge.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {challenge.owasp}
            </div>
          </div>
        </div>

        {/* Center: Timer & Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'var(--font-mono)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isPaused ? 'var(--status-warning-bg)' : 'var(--bg-surface-3)',
            color: isPaused ? 'var(--status-warning)' : 'var(--text-primary)',
            border: '1px solid var(--border-subtle)'
          }}>
            Time remaining: {formatTimer(remainingSeconds)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
            Fullscreen active
          </span>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleTogglePause}
            className="tech-btn tech-btn-sm tech-btn-secondary"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={() => setShowStopModal(true)}
            className="tech-btn tech-btn-sm tech-btn-secondary"
          >
            Stop lab
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="tech-btn tech-btn-sm"
            style={{ backgroundColor: 'transparent', color: 'var(--status-danger)', borderColor: 'var(--status-danger-border)' }}
          >
            Delete container
          </button>
        </div>
      </header>

      {/* Workspace Tab Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface-1)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        padding: '0 20px',
        gap: '2px',
        flexShrink: 0
      }}>
        {[
          { id: 'brief', label: 'Challenge Brief' },
          { id: 'target_app', label: 'Target Service & Endpoints' },
          { id: 'request_builder', label: 'HTTP Request Builder' },
          { id: 'verification', label: 'Oracle Verification' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Body */}
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        
        {/* TAB 1: BRIEF */}
        {activeTab === 'brief' && (
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="tech-card">
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Laboratory Brief
              </div>
              <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>{challenge.title}</h2>
              <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                {challenge.problem_statement}
              </p>

              <div style={{
                backgroundColor: 'var(--bg-surface-3)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Target Objective:
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {challenge.objective}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Container Address</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{targetUrl}</div>
                </div>
                <div style={{ padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Session Account</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {challenge.authenticated_user} : {challenge.credentials?.password || 'peter'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="tech-btn tech-btn-primary" onClick={() => setActiveTab('request_builder')}>
                  Open HTTP Request Builder
                </button>
                <button className="tech-btn tech-btn-secondary" onClick={() => setActiveTab('target_app')}>
                  View Target Endpoints
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TARGET SERVICE & ENDPOINTS */}
        {activeTab === 'target_app' && (
          <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="tech-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px' }}>Target Container Service</h3>
                  <p style={{ fontSize: '12px' }}>Container Port: {assignedPort} • Active environment</p>
                </div>
                <button className="tech-btn tech-btn-sm tech-btn-primary" onClick={() => setActiveTab('request_builder')}>
                  Open in Request Builder
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="tech-badge badge-green">GET</span>
                    <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>/api/v1/users/me</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Authenticated profile</span>
                </div>

                {exerciseId === 'ex-bfla-01' && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    backgroundColor: 'var(--status-danger-bg)',
                    border: '1px solid var(--status-danger-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="tech-badge badge-red">DELETE</span>
                      <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>/api/v1/users/carlos</span>
                    </div>
                    <button 
                      className="tech-btn tech-btn-sm tech-btn-primary"
                      onClick={() => {
                        setMethod('DELETE');
                        setEndpoint('/api/v1/users/carlos');
                        setActiveTab('request_builder');
                      }}
                    >
                      Load into Builder
                    </button>
                  </div>
                )}

                {exerciseId === 'ex-bola-01' && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    backgroundColor: 'var(--status-warning-bg)',
                    border: '1px solid var(--status-warning-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="tech-badge badge-amber">GET</span>
                      <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>/api/v1/invoices/INV-888</span>
                    </div>
                    <button 
                      className="tech-btn tech-btn-sm tech-btn-primary"
                      onClick={() => {
                        setMethod('GET');
                        setEndpoint('/api/v1/invoices/INV-888');
                        setActiveTab('request_builder');
                      }}
                    >
                      Load into Builder
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HTTP REQUEST BUILDER */}
        {activeTab === 'request_builder' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '100%' }}>
            
            {/* Left: Request Construction */}
            <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                HTTP Request Builder
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  style={{ width: '110px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}
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
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                />

                <button 
                  className="tech-btn tech-btn-primary"
                  onClick={handleSendRequest}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Request Headers
                </label>
                <textarea 
                  value={requestHeaders}
                  onChange={(e) => setRequestHeaders(e.target.value)}
                  style={{ height: '70px', fontFamily: 'var(--font-mono)', fontSize: '11px', resize: 'none' }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  JSON Payload Body
                </label>
                <textarea 
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  style={{ flex: 1, minHeight: '140px', fontFamily: 'var(--font-mono)', fontSize: '12px', resize: 'none' }}
                />
              </div>
            </div>

            {/* Right: Response Telemetry */}
            <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Target Response Telemetry
                </div>
                {responseStatus && (
                  <span className={`tech-badge ${responseStatus === 200 ? 'badge-green' : 'badge-red'}`}>
                    Status: {responseStatus}
                  </span>
                )}
              </div>

              <pre style={{
                flex: 1,
                backgroundColor: 'var(--bg-surface-3)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: '1.5',
                overflow: 'auto',
                margin: 0
              }}>
                {responseOutput}
              </pre>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Submit state to Oracle for verification check
                </span>
                <button 
                  className="tech-btn tech-btn-sm tech-btn-secondary"
                  onClick={handleVerifyLab}
                  disabled={loading}
                >
                  Validate Objective
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: ORACLE VERIFICATION */}
        {activeTab === 'verification' && (
          <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="tech-card">
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Oracle Verification Engine
              </div>
              <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>
                Ground-Truth Objective Verification
              </h2>
              <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
                The Oracle engine inspects target container database state mutations to verify exploitation.
              </p>

              {verificationResult ? (
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: verificationResult.verified ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                  border: `1px solid ${verificationResult.verified ? 'var(--status-success-border)' : 'var(--status-danger-border)'}`,
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: '600', color: verificationResult.verified ? 'var(--status-success)' : 'var(--status-danger)', marginBottom: '4px' }}>
                    {verificationResult.verified ? 'Objective Verified (Score: 100/100)' : 'Verification Incomplete'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {verificationResult.message || (verificationResult.verified ? 'Target exploit confirmed.' : 'Target resource state unmutated.')}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface-3)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginBottom: '20px'
                }}>
                  Execute a payload in the HTTP Request Builder and run verification.
                </div>
              )}

              <button 
                className="tech-btn tech-btn-primary" 
                style={{ width: '100%', padding: '12px' }}
                onClick={handleVerifyLab}
                disabled={loading}
              >
                {loading ? 'Evaluating container state...' : 'Run Oracle Verification Check'}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* STOP MODAL */}
      {showStopModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="tech-card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Stop Lab Instance?</h3>
            <p style={{ fontSize: '13px', marginBottom: '20px' }}>
              Your progress will be preserved and container resources safely paused.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-secondary" onClick={() => setShowStopModal(false)}>Cancel</button>
              <button className="tech-btn tech-btn-primary" onClick={handleStopLab}>Stop and Return</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="tech-card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--status-danger)', marginBottom: '8px' }}>Delete Container?</h3>
            <p style={{ fontSize: '13px', marginBottom: '20px' }}>
              This will destroy the active Docker container instance and clear transient session state.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="tech-btn" style={{ backgroundColor: 'var(--status-danger)', color: '#ffffff' }} onClick={handleDeleteContainer}>Delete Instance</button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {showCompleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="tech-card" style={{ maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-success-bg)',
              color: 'var(--status-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Exercise Completed</h2>
            <p style={{ fontSize: '13px', marginBottom: '24px' }}>
              Exploit verified successfully for <strong>{challenge.title}</strong> (100 pts).
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="tech-btn tech-btn-secondary" onClick={() => setShowCompleteModal(false)}>Review Workspace</button>
              <button className="tech-btn tech-btn-primary" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
