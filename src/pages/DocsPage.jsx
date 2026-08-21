import React, { useState } from 'react';
import { Search, BookOpen, Download, ShieldCheck, Code, ExternalLink } from 'lucide-react';
import { exerciseApi } from '../services/api';

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const docs = [
    {
      id: 'bola',
      category: 'vulnerabilities',
      owasp: 'API1:2023',
      title: 'Broken Object Level Authorization (BOLA / IDOR)',
      summary: 'BOLA occurs when an API endpoint accepts object identifiers without verifying caller ownership.',
      attack: 'GET /api/v1/users/1002/invoices',
      mitigation: 'Validate object ownership on every request: req.user.id === requestedObjectId'
    },
    {
      id: 'authn',
      category: 'vulnerabilities',
      owasp: 'API2:2023',
      title: 'Broken Authentication',
      summary: 'Weak session handling, unvalidated JWT signatures, or vulnerable token refresh logic.',
      attack: 'POST /api/v1/auth/refresh (algorithm: "none")',
      mitigation: 'Enforce strong JWT signing algorithms (RS256) and strict token expiration.'
    },
    {
      id: 'mass-assign',
      category: 'vulnerabilities',
      owasp: 'API3:2023',
      title: 'Broken Object Property Level Authorization',
      summary: 'Excessive data exposure and mass assignment vulnerability allowing clients to modify protected fields.',
      attack: 'PATCH /api/v1/users/me { "role": "admin" }',
      mitigation: 'Use strict DTO schema validation and whitelist permissible update parameters.'
    },
    {
      id: 'ssrf',
      category: 'vulnerabilities',
      owasp: 'API7:2023',
      title: 'Server Side Request Forgery (SSRF)',
      summary: 'API endpoint fetches external resources without validating the target URL host/IP.',
      attack: 'POST /api/v1/fetch-avatar { "url": "http://169.254.169.254/latest/meta-data/" }',
      mitigation: 'Whitelist allowed protocol schemas and restrict outbound connections to private IP ranges.'
    }
  ];

  const handleDownloadPostman = () => {
    window.open(exerciseApi.getPostmanUrl(), '_blank');
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.owasp.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '32px' }}>
      
      {/* Title */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // DOCUMENTATION HUB & REFERENCE
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          API Security Documentation & Reference
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Searchable OWASP API Security Top 10 explainers, vulnerability patterns, and endpoint reference.
        </p>
      </div>

      {/* Postman Collection Master Banner */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px 24px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>
            📬 Export Master Postman Collection & OpenAPI Specs
          </div>
          <p style={{ fontSize: '12px', color: '#15803d', margin: 0 }}>
            Download the official Postman Collection v2.1.0 (.json) containing pre-configured request templates for all 10 OWASP API scenarios.
          </p>
        </div>
        <button className="tech-btn tech-btn-primary" onClick={handleDownloadPostman} style={{ background: '#15803d', borderColor: '#15803d' }}>
          <Download size={14} />
          <span>Export Postman Collection</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="tech-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text"
          placeholder="Search OWASP vulnerabilities, endpoints, or mitigations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#0f172a' }}
        />
      </div>

      {/* Docs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredDocs.map(doc => (
          <div key={doc.id} className="tech-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="tech-badge badge-cyan">{doc.owasp}</span>
              <span className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>DOCUMENTATION ARTICLE</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              {doc.title}
            </h3>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>
              {doc.summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div>
                <div className="mono" style={{ fontSize: '10px', color: '#ef4444', fontWeight: '700', marginBottom: '4px' }}>
                  ATTACK PATTERN
                </div>
                <code className="mono" style={{ fontSize: '11px', color: '#0f172a', background: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'block' }}>
                  {doc.attack}
                </code>
              </div>

              <div>
                <div className="mono" style={{ fontSize: '10px', color: '#059669', fontWeight: '700', marginBottom: '4px' }}>
                  RECOMMENDED MITIGATION
                </div>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  {doc.mitigation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
