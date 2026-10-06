import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
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
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      
      {/* Title Header */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // STEP 1 OF 5 • BASELINE CONCEPTUAL EVALUATION
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Pre-Test Conceptual Assessment
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Evaluate your baseline knowledge of API authentication, authorization, BOLA, BFLA, and HTTP request interpretation before training.
        </p>
      </div>

      {loading ? (
        <div className="tech-card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Loading assessment questions...
        </div>
      ) : result ? (
        /* Results View */
        <div className="tech-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ background: '#d1fae5', color: '#059669', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Pre-Test Completed</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Your baseline assessment score has been logged to your progress profile.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>SCORE</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{result.score_percentage}%</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>CORRECT ANSWERS</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#059669' }}>{result.correct_count} / {result.total_questions}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>STATUS</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0d9488', marginTop: '6px' }}>LOGGED</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className="tech-btn tech-btn-primary" onClick={() => navigate('/training')}>
              <span>Proceed to Hands-on Training</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Questions Form */
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="tech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tech-badge badge-cyan" style={{ fontSize: '11px' }}>QUESTION {idx + 1} OF {questions.length}</span>
                <span className="mono" style={{ fontSize: '11px', color: '#64748b' }}>{q.category}</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>{q.text}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {['A', 'B', 'C', 'D'].map(optKey => {
                  const optionText = q[`option_${optKey.toLowerCase()}`];
                  const isSelected = answers[q.id] === optKey;
                  return (
                    <label 
                      key={optKey}
                      onClick={() => handleOptionSelect(q.id, optKey)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--brand-navy)' : '1px solid #e2e8f0',
                        background: isSelected ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: isSelected ? '#0f172a' : '#334155',
                        fontWeight: isSelected ? '600' : '400',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input 
                        type="radio"
                        name={`q_${q.id}`}
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ accentColor: 'var(--brand-orange)' }}
                      />
                      <span><strong>{optKey}.</strong> {optionText}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="tech-btn tech-btn-primary" disabled={submitting} style={{ padding: '12px 24px', fontSize: '14px' }}>
              <span>{submitting ? 'Submitting Assessment...' : 'Submit Pre-Test Assessment'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
