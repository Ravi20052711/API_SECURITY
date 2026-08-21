import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Send, ShoppingBag, Terminal, Shield, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { oracleApi } from '../services/api';

export default function PortSwiggerLabPage({ navigate }) {
  const [labSolved, setLabSolved] = useState(false);
  const [activeTab, setActiveTab] = useState('lab'); // 'lab' | 'burp'
  const [storeBalance, setStoreBalance] = useState(100.00);

  // Burp Suite Repeater State
  const [repeaterMethod, setRepeaterMethod] = useState('POST');
  const [repeaterUrl, setRepeaterUrl] = useState('/api/v1/checkout');
  const [repeaterBody, setRepeaterBody] = useState(JSON.stringify({
    "product_id": "lighted-feather-jacket",
    "quantity": 1,
    "chosen_discount": {
      "percentage": 0
    }
  }, null, 2));

  const [repeaterResponse, setRepeaterResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Normal Checkout Attempt (Without Burp Suite)
  const handleNormalCheckout = () => {
    setToastMessage('❌ Checkout Failed: Insufficient store credit! ($1,337.00 required, balance: $100.00)');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Burp Suite Repeater Request Submission
  const handleSendRepeaterRequest = async () => {
    setLoading(true);
    const startTime = performance.now();

    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(repeaterBody);
      } catch (err) {
        setRepeaterResponse({
          status: 400,
          statusText: 'Bad Request',
          time: '12ms',
          data: { error: "Malformed JSON payload in request body", detail: err.message }
        });
        setLoading(false);
        return;
      }

      // Mass Assignment Vulnerability Evaluation Logic:
      // Checks if payload contains chosen_discount with percentage 100 or role admin
      const isMassAssignmentExploited = (
        (parsedBody.chosen_discount && Number(parsedBody.chosen_discount.percentage) === 100) ||
        (parsedBody.discount && Number(parsedBody.discount) === 100) ||
        (parsedBody.price === 0) ||
        (parsedBody.role === 'admin' || parsedBody.role === 'administrator')
      );

      const duration = Math.round(performance.now() - startTime);

      if (isMassAssignmentExploited) {
        setLabSolved(true);
        setRepeaterResponse({
          status: 200,
          statusText: 'OK',
          time: `${duration}ms`,
          data: {
            status: "ORDER_PLACED_SUCCESS",
            message: "Lighted Feather Jacket purchased successfully for $0.00!",
            order_id: "SWIGGER-ORDER-9901",
            applied_discount: "100%",
            amount_charged: 0.00,
            account_balance_remaining: 100.00,
            vulnerability: "Mass Assignment (API3:2023)",
            flag: "SOLVED: MASS_ASSIGNMENT_CHECKOUT_BYPASS"
          }
        });
        setToastMessage('🎉 CONGRATULATIONS! LAB SOLVED: Mass Assignment Vulnerability Exploited!');
      } else {
        setRepeaterResponse({
          status: 400,
          statusText: 'Payment Required / Insufficient Funds',
          time: `${duration}ms`,
          data: {
            status: "PAYMENT_FAILED",
            error: "Insufficient store balance ($100.00 available, $1,337.00 required)",
            hint: "Try inspecting API parameters accepted by the checkout service. Can you inject a 'chosen_discount' or 'price' property?"
          }
        });
      }

    } catch (err) {
      setRepeaterResponse({
        status: 500,
        statusText: 'Internal Server Error',
        time: '45ms',
        data: { error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* 1. Official PortSwigger Dark Header */}
      <header style={{ background: '#141414', borderBottom: '1px solid #262626', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/modules')} style={{ background: 'none', border: 'none', color: '#a3a3a3', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <ArrowLeft size={16} /> Exit Lab
          </button>

          <div style={{ height: '20px', width: '1px', background: '#333333' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#ff6633', color: '#ffffff', fontSize: '11px', fontWeight: '900', padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.5px' }}>
              PORTSWIGGER
            </span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
              Web Security Academy
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#a3a3a3' }}>User: <strong style={{ color: '#ffffff' }}>wiener</strong> (Store Balance: ${storeBalance.toFixed(2)})</span>
          <button 
            onClick={() => setActiveTab(activeTab === 'lab' ? 'burp' : 'lab')} 
            style={{ background: '#262626', border: '1px solid #404040', color: '#ffffff', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Terminal size={14} color="#ff6633" />
            <span>{activeTab === 'lab' ? 'Open Burp Repeater Tool' : 'View Target Store'}</span>
          </button>
        </div>
      </header>

      {/* 2. Solved Banner Alert (When Lab is Solved) */}
      {labSolved && (
        <div style={{ background: '#052e16', borderBottom: '2px solid #22c55e', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4ade80' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={24} color="#22c55e" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff' }}>
                Congratulations, you solved the lab!
              </div>
              <div style={{ fontSize: '12px', color: '#86efac' }}>
                Vulnerability Exploited: Mass Assignment / Property Level Authorization (API3:2023). Applied 100% discount payload!
              </div>
            </div>
          </div>
          <span style={{ background: '#22c55e', color: '#052e16', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
            SOLVED
          </span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '72px',
          right: '24px',
          background: toastMessage.includes('SOLVED') ? '#052e16' : '#450a0a',
          border: `1px solid ${toastMessage.includes('SOLVED') ? '#22c55e' : '#f87171'}`,
          color: toastMessage.includes('SOLVED') ? '#4ade80' : '#fca5a5',
          padding: '12px 20px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '700',
          zIndex: 300,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* 3. Lab Instructions Bar */}
      <div style={{ background: '#171717', borderBottom: '1px solid #262626', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#ff6633', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '2px 6px', borderRadius: '3px' }}>
              LAB
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
              Exploiting a mass assignment vulnerability
            </h1>
            <span style={{
              background: labSolved ? '#052e16' : '#451a03',
              color: labSolved ? '#4ade80' : '#ff6633',
              border: `1px solid ${labSolved ? '#22c55e' : '#b45309'}`,
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {labSolved ? '✔ SOLVED' : 'UNSOLVED'}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#d4d4d4', lineHeight: '1.6', margin: 0 }}>
            This lab has a mass assignment vulnerability. To solve the lab, find an API endpoint that accepts JSON parameters, exploit property-level authorization to inject <code style={{ background: '#262626', color: '#ff6633', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>"chosen_discount": &#123; "percentage": 100 &#125;</code>, and purchase the <strong>Lighted Feather Jacket</strong> for $0.00.
          </p>
        </div>
      </div>

      {/* 4. Main Lab Interface */}
      <main style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 24px' }}>
        
        {/* TAB 1: TARGET APPLICATION (SHOPSWIGGER STORE) */}
        {activeTab === 'lab' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Store Top Header Bar */}
            <div style={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag color="#ff6633" size={20} />
                  ShopSwigger E-Commerce Store Target
                </h2>
                <p style={{ fontSize: '12px', color: '#a3a3a3', margin: 0 }}>
                  Logged in user: <strong style={{ color: '#ffffff' }}>wiener</strong> | Account Balance: <span style={{ color: '#22c55e', fontWeight: '700' }}>${storeBalance.toFixed(2)}</span>
                </p>
              </div>

              <button 
                onClick={() => setActiveTab('burp')}
                style={{ background: '#ff6633', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Terminal size={14} />
                <span>Intercept Request in Burp Repeater</span>
              </button>
            </div>

            {/* Product Catalog Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              
              {/* Product 1: Target Item (Lighted Feather Jacket) */}
              <div style={{ background: '#171717', border: '2px solid #ff6633', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#262626', borderRadius: '6px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  🧥
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#ff6633', fontWeight: '800', letterSpacing: '0.5px' }}>TARGET LAB ITEM</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>Lighted Feather Jacket</h3>
                  <p style={{ fontSize: '12px', color: '#a3a3a3', lineHeight: '1.4' }}>High-visibility illuminated jacket for advanced API penetration testing.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>$1,337.00</span>
                  <button 
                    onClick={handleNormalCheckout}
                    style={{ background: '#262626', border: '1px solid #404040', color: '#ffffff', padding: '8px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Product 2: Cheater Goggles */}
              <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#262626', borderRadius: '6px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  🥽
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#737373', fontWeight: '700' }}>STANDARD ITEM</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>Cheater Goggles</h3>
                  <p style={{ fontSize: '12px', color: '#a3a3a3', lineHeight: '1.4' }}>Anti-glare security analyst inspection goggles.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>$299.00</span>
                  <button 
                    onClick={handleNormalCheckout}
                    style={{ background: '#262626', border: '1px solid #404040', color: '#ffffff', padding: '8px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Product 3: Cyber Helmet */}
              <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#262626', borderRadius: '6px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  🪖
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#737373', fontWeight: '700' }}>STANDARD ITEM</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>API Security Cyber Helmet</h3>
                  <p style={{ fontSize: '12px', color: '#a3a3a3', lineHeight: '1.4' }}>Reinforced tactical helmet for security research labs.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>$499.00</span>
                  <button 
                    onClick={handleNormalCheckout}
                    style={{ background: '#262626', border: '1px solid #404040', color: '#ffffff', padding: '8px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: BURP SUITE REPEATER INTERCEPTOR WIDGET */}
        {activeTab === 'burp' && (
          <div style={{ background: '#171717', border: '1px solid #333333', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #262626', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal color="#ff6633" size={18} />
                  Burp Suite HTTP Repeater Tool
                </h3>
                <p style={{ fontSize: '12px', color: '#a3a3a3', margin: 0 }}>
                  Craft and send HTTP requests directly to the vulnerable target checkout API (`POST /api/v1/checkout`).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setRepeaterBody(JSON.stringify({
                    "product_id": "lighted-feather-jacket",
                    "quantity": 1,
                    "chosen_discount": {
                      "percentage": 100
                    }
                  }, null, 2))}
                  style={{ background: '#262626', border: '1px solid #404040', color: '#ff6633', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Inject 100% Discount Payload
                </button>

                <button 
                  onClick={handleSendRepeaterRequest} 
                  disabled={loading}
                  style={{ background: '#ff6633', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '4px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  <span>{loading ? 'Sending Request...' : 'Send Request'}</span>
                </button>
              </div>
            </div>

            {/* HTTP Request & Response Split Console */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Left Column: HTTP Request Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#a3a3a3', letterSpacing: '0.5px' }}>
                  HTTP REQUEST (REPEATER)
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={repeaterMethod} 
                    onChange={(e) => setRepeaterMethod(e.target.value)}
                    style={{ background: '#262626', border: '1px solid #404040', color: '#ff6633', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '800', fontFamily: 'monospace' }}
                  >
                    <option value="POST">POST</option>
                    <option value="PATCH">PATCH</option>
                    <option value="PUT">PUT</option>
                  </select>

                  <input 
                    type="text" 
                    value={repeaterUrl} 
                    onChange={(e) => setRepeaterUrl(e.target.value)}
                    style={{ flex: 1, background: '#262626', border: '1px solid #404040', color: '#ffffff', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
                  />
                </div>

                <div style={{ fontSize: '11px', color: '#737373', fontFamily: 'monospace' }}>
                  Host: shopswigger.net | Content-Type: application/json
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#a3a3a3', fontWeight: '700' }}>JSON REQUEST BODY (EDIT VULNERABLE PARAMETERS):</label>
                  <textarea 
                    rows={12}
                    value={repeaterBody}
                    onChange={(e) => setRepeaterBody(e.target.value)}
                    style={{
                      background: '#0d0d0d',
                      border: '1px solid #333333',
                      color: '#4ade80',
                      padding: '12px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Right Column: HTTP Response Viewer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#a3a3a3', letterSpacing: '0.5px' }}>
                  HTTP RESPONSE
                </div>

                {repeaterResponse ? (
                  <div style={{ background: '#0d0d0d', border: '1px solid #333333', borderRadius: '4px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #262626', paddingBottom: '8px', fontSize: '12px' }}>
                      <span style={{ background: repeaterResponse.status === 200 ? '#052e16' : '#450a0a', color: repeaterResponse.status === 200 ? '#4ade80' : '#f87171', border: `1px solid ${repeaterResponse.status === 200 ? '#22c55e' : '#f87171'}`, padding: '2px 8px', borderRadius: '3px', fontWeight: '800', fontFamily: 'monospace' }}>
                        HTTP/1.1 {repeaterResponse.status} {repeaterResponse.statusText}
                      </span>
                      <span style={{ color: '#737373', fontSize: '11px', fontFamily: 'monospace' }}>🕒 {repeaterResponse.time}</span>
                    </div>

                    <pre style={{ margin: 0, color: repeaterResponse.status === 200 ? '#4ade80' : '#fca5a5', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.5', overflow: 'auto' }}>
                      {JSON.stringify(repeaterResponse.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div style={{ background: '#0d0d0d', border: '1px dashed #333333', borderRadius: '4px', padding: '40px', textAlign: 'center', color: '#737373', fontSize: '12px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ▷ Click "Send Request" to view raw HTTP response.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
