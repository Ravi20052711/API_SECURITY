import React, { useState, useEffect } from 'react';
import { assessmentApi } from '../services/api';

export default function PreTestPage({ navigate }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const data = await assessmentApi.getQuestions('PRE');
        if (data && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleOptionSelect = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await assessmentApi.submitAttempt('PRE', answers);
      setResult(res);
    } catch {
      setResult({ score_percentage: 0, total_questions: 8, correct_count: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Step 1 of 5 • Baseline Evaluation
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          Pre-Test Conceptual Assessment
        </h1>
        <p style={{ fontSize: '14px', maxWidth: '640px' }}>
          Evaluate your baseline understanding of API security principles, authorization models, and request interpretation prior to practical lab training.
        </p>
      </div>

      {result ? (
        <div className="tech-card" style={{ padding: '36px', textAlign: 'center' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-success-bg)',
            color: 'var(--status-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '22px',
            fontWeight: '700'
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Pre-Test Baseline Recorded</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Baseline score: <strong>{result.score_percentage || 0}%</strong> ({result.correct_count || 0} of {result.total_questions || 8} correct).
          </p>
          <button 
            className="tech-btn tech-btn-primary tech-btn-lg"
            onClick={() => navigate('/training')}
          >
            Proceed to Step 2: Guided Labs
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="tech-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="tech-badge">Question {idx + 1} of {questions.length}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{q.domain}</span>
              </div>

              <h3 style={{ fontSize: '15px', marginBottom: '14px', lineHeight: '1.4' }}>
                {q.question_text}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options && Object.entries(q.options).map(([optKey, optText]) => {
                  const isSelected = answers[q.id] === optKey;
                  return (
                    <label 
                      key={optKey}
                      onClick={() => handleOptionSelect(q.id, optKey)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface-2)',
                        border: isSelected ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        checked={isSelected} 
                        onChange={() => {}} 
                        style={{ width: 'auto' }}
                      />
                      <span style={{ fontSize: '13px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        <strong>{optKey.toUpperCase()}.</strong> {optText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <button 
            type="submit" 
            className="tech-btn tech-btn-primary tech-btn-lg" 
            disabled={submitting || questions.length === 0}
            style={{ width: '100%', marginTop: '12px' }}
          >
            {submitting ? 'Submitting Pre-Test...' : 'Submit Pre-Test Evaluation'}
          </button>
        </form>
      )}

    </div>
  );
}
