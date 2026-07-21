import React, { useState } from 'react';
import { batchPredict } from '../services/api';
import { FaUpload, FaFileExport, FaTable, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const BatchPrediction = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const processFile = async (file) => {
    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const text = event.target.result;
          let data;

          if (file.name.endsWith('.json')) {
            data = JSON.parse(text);
          } else if (file.name.endsWith('.csv')) {
            // Simple CSV parser
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            
            data = lines.slice(1).map(line => {
              const values = line.split(',');
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = values[index] ? values[index].trim() : '';
              });
              return obj;
            });
          } else {
            throw new Error('Unsupported file format. Please upload CSV or JSON.');
          }

          const response = await batchPredict(data);
          setResults(response);
        } catch (err) {
          setError(err.message || 'Error processing file');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsText(file);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const csv = convertToCSV(results.results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `churn_predictions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const convertToCSV = (data) => {
    const headers = ['Index', 'Churn', 'Churn Probability', 'Confidence', 'Risk Level', 'Error'];
    const rows = data.map(item => [
      item.index,
      item.churn ? 'Yes' : 'No',
      item.churn_probability ? (item.churn_probability * 100).toFixed(1) + '%' : 'N/A',
      item.confidence ? (item.confidence * 100).toFixed(1) + '%' : 'N/A',
      item.risk_level || 'N/A',
      item.error || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getStats = () => {
    if (!results) return null;

    const total = results.results.length;
    const churnCount = results.results.filter(r => r.churn).length;
    const errors = results.results.filter(r => r.error).length;
    const validCount = total - errors;
    const avgProbability = validCount > 0
      ? results.results.filter(r => !r.error).reduce((sum, r) => sum + r.churn_probability, 0) / validCount
      : 0;

    return {
      total,
      churnCount,
      noChurnCount: total - churnCount - errors,
      errors,
      churnRate: validCount > 0 ? ((churnCount / validCount) * 100).toFixed(1) : '0.0',
      avgProbability: (avgProbability * 100).toFixed(1)
    };
  };

  const getRiskClass = (level) => {
    const levelMap = {
      'Low': 'risk-low',
      'Medium': 'risk-medium',
      'High': 'risk-high',
      'Critical': 'risk-critical'
    };
    return levelMap[level] || 'risk-medium';
  };

  return (
    <div className="batch-prediction-container">
      {/* Upload Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <FaUpload style={{ fontSize: '1.8rem', color: '#A64A2A' }} />
          <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', margin: 0 }}>
            Upload Customer Ledger
          </h3>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div 
          className={`dropzone-slot ${dragActive ? 'dragging' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
            disabled={loading}
          />
          <label 
            htmlFor="file-upload" 
            style={{ 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'block'
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <FaTable style={{ fontSize: '2.5rem', color: '#65543D' }} />
            </div>
            <p style={{ fontSize: '1.1rem', color: '#211A15', marginBottom: '0.4rem', fontWeight: '500' }}>
              {loading ? 'Processing Ledger...' : 'Click to select or drop ledger file here'}
            </p>
            {fileName && (
              <p style={{ fontSize: '0.9rem', color: '#A64A2A', fontWeight: 'bold', margin: '0.4rem 0' }}>
                Active File: {fileName}
              </p>
            )}
            <p style={{ fontSize: '0.85rem', color: '#65543D', fontFamily: 'ui-monospace, monospace' }}>
              SUPPORTED FORMATS: .CSV OR .JSON (MAX 10MB)
            </p>
          </label>
        </div>

        <div style={{ 
          marginTop: '1.5rem',
          padding: '1.2rem',
          background: 'rgba(101, 84, 61, 0.06)',
          border: '1px solid rgba(101, 84, 61, 0.18)',
          borderRadius: '2px'
        }}>
          <h4 style={{ 
            fontFamily: 'Cormorant Garamond, Georgia, serif', 
            fontSize: '1.2rem', 
            marginBottom: '0.6rem', 
            color: '#211A15' 
          }}>
            📋 Format Requirements
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#65543D', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li>Provide headers matching the exact field names (e.g., tenure, MonthlyCharges, Contract).</li>
            <li>CSV format must separate values with commas.</li>
            <li>JSON format expects an array of customer profile objects.</li>
            <li>Batch sizes are optimized for up to 1000 records.</li>
          </ul>
        </div>
      </div>

      {/* Results Section */}
      {loading && (
        <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '3rem' }}>
          <span className="loading-spinner" style={{ width: '40px', height: '40px' }}></span>
          <p style={{ marginTop: '1rem', color: '#65543D', fontFamily: 'ui-monospace, monospace', fontSize: '0.9rem' }}>
            EXECUTING BATCH PIPELINE...
          </p>
        </div>
      )}

      {results && !loading && (
        <>
          {/* Statistics Summary */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Batch Ledger Summary
            </h3>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Ledger Count</div>
                <div className="metric-value">{getStats().total}</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Churn Count</div>
                <div className="metric-value" style={{ color: '#A64A2A' }}>
                  {getStats().churnCount}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Stable Count</div>
                <div className="metric-value" style={{ color: '#2E6F40' }}>
                  {getStats().noChurnCount}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Churn Rate</div>
                <div className="metric-value">{getStats().churnRate}%</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Avg Risk Scale</div>
                <div className="metric-value">{getStats().avgProbability}%</div>
              </div>

              {getStats().errors > 0 && (
                <div className="metric-card">
                  <div className="metric-label">Invalid Rows</div>
                  <div className="metric-value" style={{ color: '#A64A2A' }}>
                    {getStats().errors}
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              onClick={downloadResults}
              style={{ marginTop: '1rem' }}
            >
              <FaFileExport />
              <span>Export Prediction Ledger</span>
            </button>
          </div>

          {/* Results Table */}
          <div className="card" style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Customer Risk Ledger
            </h3>
            
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Verdict</th>
                  <th>Churn Risk</th>
                  <th>Stability</th>
                  <th>Risk Tier</th>
                  <th>Diagnostics</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((result, idx) => (
                  <tr 
                    key={idx}
                    style={{ 
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(101, 84, 61, 0.04)'
                    }}
                  >
                    <td style={{ fontWeight: '600' }}>{result.index}</td>
                    <td>
                      {result.error ? (
                        <span style={{ color: '#A64A2A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaExclamationTriangle /> Error
                        </span>
                      ) : result.churn ? (
                        <span style={{ fontWeight: '600', color: '#A64A2A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaExclamationTriangle /> Churn
                        </span>
                      ) : (
                        <span style={{ fontWeight: '600', color: '#2E6F40', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaCheckCircle /> Stable
                        </span>
                      )}
                    </td>
                    <td>
                      {result.churn_probability 
                        ? `${(result.churn_probability * 100).toFixed(1)}%`
                        : '-'
                      }
                    </td>
                    <td>
                      {result.churn_probability 
                        ? `${((1 - result.churn_probability) * 100).toFixed(1)}%`
                        : '-'
                      }
                    </td>
                    <td>
                      {result.risk_level && (
                        <span className={`risk-badge ${getRiskClass(result.risk_level)}`}>
                          {result.risk_level}
                        </span>
                      )}
                    </td>
                    <td>
                      {result.error ? (
                        <span style={{ fontSize: '0.8rem', color: '#A64A2A', fontStyle: 'italic' }}>
                          {result.error}
                        </span>
                      ) : (
                        <span style={{ color: '#2E6F40', fontSize: '0.85rem' }}>Passed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default BatchPrediction;
