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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const exParam = params.get('id') || 'ex-bfla-01';
    const sessParam = params.get('session_id');

    setExerciseId(exParam);
    if (sessParam) setSessionId(sessParam);

    if (exerciseApi.getExerciseById) {
      exerciseApi.getExerciseById(exParam)
        .then(res => {
          if (res && res.challenge) {
            setChallenge(res.challenge);
            if (res.challenge.time_limit) setRemainingSeconds(res.challenge.time_limit);
          }
        })
        .catch(() => {});
    }

    labApi.startLab(exParam, currentUser?.email || 'student@lab.dev')
      .then(labRes => {
        if (labRes) {
          if (labRes.sessionId) setSessionId(labRes.sessionId);
          if (labRes.token) setSessionToken(labRes.token);
          if (labRes.port) {
            setAssignedPort(labRes.port);
            setTargetUrl(`http://localhost:${labRes.port}`);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isPaused || isExpired) return;
    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, isExpired]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleExecuteRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseOutput("Transmitting request to isolated Docker container...");

    try {
      const res = await labApi.proxyRequest({
        sessionId,
        exerciseId,
        method,
        endpoint,
        headers: requestHeaders,
        body: requestBody
      });

      if (res) {
        setResponseStatus(res.status || 200);
        setResponseOutput(typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : String(res.data));
      }
    } catch (err) {
      setResponseStatus(err.response?.status || 500);
      setResponseOutput(JSON.stringify(err.response?.data || { error: "Failed to connect to container port " + assignedPort }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOracle = async () => {
    setLoading(true);
    try {
      const res = await oracleApi.evaluateSubmission({
        exerciseId,
        sessionId,
        userEmail: currentUser?.email || 'student@lab.dev',
        payload: { method, endpoint, headers: requestHeaders, body: requestBody }
      });

      if (res) {
        setVerificationResult(res);
        setActiveTab('verification');
      }
    } catch (err) {
      setVerificationResult({
        verified: false,
        message: "Verification failed. Target container state does not match expected ground truth."
      });
      setActiveTab('verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      
      {/* Top Workbench Header */}
      <header style={{
        height: '52px',
        backgroundColor: 'var(--bg-surface-1)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="tech-btn tech-btn-sm tech-btn-secondary"
            onClick={() => navigate('/modules')}
          >
            ← Exit Lab
          </button>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)' }}>{challenge.lab_id}</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginLeft: '8px' }}>{challenge.title}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="badge-emerald" style={{ fontSize: '11px' }}>
            Port: {assignedPort}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: remainingSeconds < 300 ? 'var(--status-danger)' : 'var(--text-primary)' }}>
            <span>⏱ {formatTimer(remainingSeconds)}</span>
          </div>
          <button 
            className="tech-btn tech-btn-sm tech-btn-primary"
            onClick={handleVerifyOracle}
          >
            Verify Solution
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
        
        {/* Left Side: Instructions & Documentation */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-1)' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '0 16px', display: 'flex', gap: '16px' }}>
            {['brief', 'verification'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 0',
                  fontSize: '13px',
                  fontWeight: activeTab === tab ? '700' : '500',
                  color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'brief' ? 'Challenge Brief' : 'Oracle Verification'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeTab === 'brief' && (
              <>
                <div>
                  <span className="badge-emerald" style={{ marginBottom: '8px' }}>{challenge.owasp}</span>
                  <h2 style={{ fontSize: '20px', marginTop: '6px' }}>{challenge.title}</h2>
                </div>

                <div className="tech-card" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                  <h3 style={{ fontSize: '14px', marginBottom: '6px', color: 'var(--text-primary)' }}>Scenario Overview</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{challenge.problem_statement}</p>
                </div>

                <div className="tech-card">
                  <h3 style={{ fontSize: '14px', marginBottom: '6px', color: 'var(--accent-primary)' }}>Learning Objective</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{challenge.objective}</p>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>LAB CREDENTIALS & TARGETS</div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    Target User: <span style={{ color: 'var(--status-danger)' }}>{challenge.target_user}</span><br />
                    Authenticated Role: {challenge.authenticated_user} (password: {challenge.credentials?.password})<br />
                    Container Endpoint: http://localhost:{assignedPort}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'verification' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '18px' }}>Oracle Verification Result</h2>
                {verificationResult ? (
                  <div style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: verificationResult.verified ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                    border: `1px solid ${verificationResult.verified ? 'var(--status-success-border)' : 'var(--status-danger-border)'}`
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: verificationResult.verified ? 'var(--status-success)' : 'var(--status-danger)', marginBottom: '8px' }}>
                      {verificationResult.verified ? '✓ Lab Challenge Completed' : '✕ Verification Unsuccessful'}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {verificationResult.message || (verificationResult.verified ? "State diff confirms target user 'carlos' was successfully removed." : "Target state assertions failed.")}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Click 'Verify Solution' to run the independent backend Oracle evaluation.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: HTTP Request Builder & Response Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>

          {/* Request Config Panel */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                style={{ width: '110px', fontWeight: '700', color: 'var(--accent-primary)' }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>

              <input
                type="text"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px' }}
              />

              <button 
                className="tech-btn tech-btn-primary"
                onClick={handleExecuteRequest}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>HTTP HEADERS</label>
              <textarea
                rows={3}
                value={requestHeaders}
                onChange={e => setRequestHeaders(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>REQUEST BODY (JSON)</label>
              <textarea
                rows={4}
                value={requestBody}
                onChange={e => setRequestBody(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>

          </div>

          {/* Response Viewer */}
          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-surface-2)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>CONTAINER TELEMETRY RESPONSE</span>
              {responseStatus && (
                <span className={`tech-badge ${responseStatus >= 200 && responseStatus < 300 ? 'badge-green' : 'badge-red'}`}>
                  Status: {responseStatus}
                </span>
              )}
            </div>

            <pre style={{
              flex: 1,
              backgroundColor: 'var(--bg-surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              overflowY: 'auto'
            }}>
              {responseOutput}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
