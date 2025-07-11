import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SteamDebugTester = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  const testUrl = async (url, label) => {
    setLoading(prev => ({ ...prev, [label]: true }));
    
    try {
      console.log(`Testing ${label}: ${url}`);
      
      const response = await fetch(url);
      console.log(`${label} response:`, response);
      
      const contentType = response.headers.get('content-type');
      console.log(`${label} content-type:`, contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setTestResults(prev => ({
          ...prev,
          [label]: {
            success: true,
            status: response.status,
            contentType,
            data: data,
            dataKeys: Object.keys(data)
          }
        }));
      } else {
        const text = await response.text();
        setTestResults(prev => ({
          ...prev,
          [label]: {
            success: false,
            status: response.status,
            contentType,
            error: 'Non-JSON response',
            response: text.substring(0, 500)
          }
        }));
      }
    } catch (error) {
      console.error(`${label} error:`, error);
      setTestResults(prev => ({
        ...prev,
        [label]: {
          success: false,
          error: error.message,
          type: 'fetch_error'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [label]: false }));
    }
  };

  const tests = [
    { url: '/.netlify/functions/debug', label: 'Debug Function' },
    { url: '/.netlify/functions/test-endpoint', label: 'Test Endpoint' },
    { url: '/.netlify/functions/steam-proxy', label: 'Steam Proxy (no params)' },
    { url: '/.netlify/functions/steam-proxy?endpoint=profile', label: 'Steam Profile' },
    { url: '/.netlify/functions/steam-proxy?endpoint=recent', label: 'Steam Recent' },
  ];

  return (
    <motion.div
      className="steam-debug-tester position-fixed bottom-0 start-0 m-3 p-3 bg-dark text-white rounded"
      style={{ 
        maxWidth: '500px',
        maxHeight: '400px',
        overflowY: 'auto',
        zIndex: 1060,
        fontSize: '0.8rem'
      }}
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h6 className="text-info mb-3">
        🔧 Steam Function Debug Tester
      </h6>
      
      <div className="mb-3">
        {tests.map(({ url, label }) => (
          <motion.button
            key={label}
            className="btn btn-outline-light btn-sm me-2 mb-2"
            onClick={() => testUrl(url, label)}
            disabled={loading[label]}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading[label] ? '⏳' : '🧪'} {label}
          </motion.button>
        ))}
      </div>

      <div className="test-results">
        {Object.entries(testResults).map(([label, result]) => (
          <motion.div
            key={label}
            className={`card mb-2 ${result.success ? 'border-success' : 'border-danger'}`}
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-body p-2">
              <h6 className={`card-title ${result.success ? 'text-success' : 'text-danger'}`}>
                {label} {result.success ? '✅' : '❌'}
              </h6>
              
              {result.success ? (
                <div className="text-light">
                  <small>Status: {result.status}</small><br/>
                  <small>Type: {result.contentType}</small><br/>
                  {result.dataKeys && (
                    <>
                      <small>Keys: [{result.dataKeys.join(', ')}]</small><br/>
                    </>
                  )}
                  <details>
                    <summary style={{ cursor: 'pointer' }}>View Data</summary>
                    <pre style={{ fontSize: '0.7rem', maxHeight: '100px', overflow: 'auto' }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-danger">
                  <small>Error: {result.error}</small><br/>
                  {result.status && <small>Status: {result.status}</small>}<br/>
                  {result.contentType && <small>Type: {result.contentType}</small>}<br/>
                  {result.response && (
                    <details>
                      <summary style={{ cursor: 'pointer' }}>View Response</summary>
                      <pre style={{ fontSize: '0.7rem', maxHeight: '100px', overflow: 'auto' }}>
                        {result.response}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-top">
        <small className="text-muted">
          💡 This tester helps debug function connectivity
        </small>
      </div>
    </motion.div>
  );
};

export default SteamDebugTester;