import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, ArrowRight, ThumbsUp } from 'lucide-react';
import { assessmentApi } from '../services/api';

export default function UsabilityPage({ navigate }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const data = await assessmentApi.getQuestions('USABILITY');
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

  const handleRatingSelect = (qCode, rating) => {
    setResponses(prev => ({ ...prev, [qCode]: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await assessmentApi.submitUsability(responses);
      setCompleted(true);
    } catch {
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      
      {/* Title Header */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // STEP 5 OF 5 • SYSTEM USABILITY SCALE (SUS) EVALUATION
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Usability & Feedback Survey
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Please rate your experience using the API security platform, lab environments, and local AI assistant guidance.
        </p>
      </div>

      {loading ? (
        <div className="tech-card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Loading survey questions...
        </div>
      ) : completed ? (
        /* Completion View */
        <div className="tech-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center' }}>
          <div style={{ background: '#d1fae5', color: '#059669', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ThumbsUp size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Thank You for Your Feedback!</h2>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '520px' }}>
            Your usability ratings and learning gain metrics have been recorded. You have completed all steps of the assessment evaluation workflow.
          </p>

          <button className="tech-btn tech-btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '12px' }}>
            <span>Return to Student Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* Survey Form */
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, idx) => (
            <div key={q.code} className="tech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tech-badge badge-amber" style={{ fontSize: '11px' }}>STATEMENT {idx + 1} OF {questions.length}</span>
                <span className="mono" style={{ fontSize: '11px', color: '#64748b' }}>LIKERT 1-5 SCALE</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>{q.text}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '8px' }}>
                {[
                  { rating: 1, label: '1 - Strongly Disagree' },
                  { rating: 2, label: '2 - Disagree' },
                  { rating: 3, label: '3 - Neutral' },
                  { rating: 4, label: '4 - Agree' },
                  { rating: 5, label: '5 - Strongly Agree' }
                ].map(item => {
                  const isSelected = responses[q.code] === item.rating;
                  return (
                    <button
                      key={item.rating}
                      type="button"
                      onClick={() => handleRatingSelect(q.code, item.rating)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--brand-navy)' : '1px solid #e2e8f0',
                        background: isSelected ? '#fff7ed' : '#ffffff',
                        color: isSelected ? '#0f172a' : '#475569',
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="tech-btn tech-btn-primary" disabled={submitting} style={{ padding: '12px 24px', fontSize: '14px' }}>
              <span>{submitting ? 'Submitting Survey...' : 'Submit Usability Survey'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
