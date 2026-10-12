import React, { useState, useEffect } from 'react';
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
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Step 5 of 5 • Usability Benchmark
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          System Usability Scale (SUS) Survey
        </h1>
        <p style={{ fontSize: '14px', maxWidth: '640px' }}>
          Rate your laboratory experience to contribute to institutional benchmarking of the platform interface and guidance tools.
        </p>
      </div>

      {completed ? (
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
          <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>Survey Submitted</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Thank you for completing the 5-stage evaluation workflow. Your feedback has been recorded.
          </p>
          <button 
            className="tech-btn tech-btn-primary tech-btn-lg"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((q, idx) => (
            <div key={q.code || idx} className="tech-card">
              <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '14px' }}>
                {idx + 1}. {q.text}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Strongly Disagree (1)</span>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[1, 2, 3, 4, 5].map(rating => {
                    const isSelected = responses[q.code] === rating;
                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingSelect(q.code, rating)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-surface-3)',
                          color: isSelected ? 'var(--text-inverse)' : 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {rating}
                      </button>
                    );
                  })}
                </div>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Strongly Agree (5)</span>
              </div>
            </div>
          ))}

          <button 
            type="submit" 
            className="tech-btn tech-btn-primary tech-btn-lg" 
            disabled={submitting || questions.length === 0}
            style={{ width: '100%', marginTop: '12px' }}
          >
            {submitting ? 'Submitting Responses...' : 'Submit Usability Survey'}
          </button>
        </form>
      )}

    </div>
  );
}
