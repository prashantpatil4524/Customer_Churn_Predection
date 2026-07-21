import React, { useState, useEffect } from 'react';
import { getModelInfo } from '../services/api';
import { FaCog, FaChartBar, FaLayerGroup } from 'react-icons/fa';

const ModelInfo = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const info = await getModelInfo();
      setModelInfo(info);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="loading-spinner" style={{ width: '40px', height: '40px' }}></span>
        <p style={{ marginTop: '1rem', color: '#65543D', fontFamily: 'ui-monospace, monospace', fontSize: '0.9rem' }}>
          LOADING MODEL STATS...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!modelInfo) {
    return null;
  }

  const { model_name, metrics, features, hyperparameters } = modelInfo;

  return (
    <div className="model-info-container">
      {/* Model Overview */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <FaCog style={{ fontSize: '1.8rem', color: '#A64A2A' }} />
          <div>
            <h2 style={{ 
              fontFamily: 'Cormorant Garamond, Georgia, serif', 
              fontSize: '1.75rem', 
              margin: 0, 
              color: '#211A15' 
            }}>
              Classifier Architecture
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#65543D', fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', letterSpacing: '1px' }}>
              {model_name.toUpperCase()}
            </p>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(101, 84, 61, 0.06)',
          border: '1px solid rgba(101, 84, 61, 0.18)',
          padding: '1.5rem',
          borderRadius: '2px',
          marginBottom: '2rem'
        }}>
          <p style={{ fontSize: '1.05rem', color: '#211A15', lineHeight: '1.7', margin: 0 }}>
            This is an industry-standard machine learning pipeline utilizing an optimized <strong>XGBoost</strong> model. 
            The system was trained using historical subscriber transactions, incorporating SMOTE to resolve class imbalance, 
            and optimized with Stratified Cross-Validation on critical features.
          </p>
        </div>

        {/* Performance Metrics */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <FaChartBar style={{ fontSize: '1.3rem', color: '#A64A2A' }} />
            <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', margin: 0 }}>
              Performance Diagnostics
            </h3>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Accuracy</div>
              <div className="metric-value">{(metrics.accuracy * 100).toFixed(2)}%</div>
              <div style={{ fontSize: '0.8rem', color: '#65543D', fontStyle: 'italic', marginTop: '0.25rem' }}>
                Overall correctness
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Precision</div>
              <div className="metric-value">{(metrics.precision * 100).toFixed(2)}%</div>
              <div style={{ fontSize: '0.8rem', color: '#65543D', fontStyle: 'italic', marginTop: '0.25rem' }}>
                True risk detection rate
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Recall</div>
              <div className="metric-value">{(metrics.recall * 100).toFixed(2)}%</div>
              <div style={{ fontSize: '0.8rem', color: '#65543D', fontStyle: 'italic', marginTop: '0.25rem' }}>
                Proportion of churners caught
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">F1-Score</div>
              <div className="metric-value">{(metrics.f1_score * 100).toFixed(2)}%</div>
              <div style={{ fontSize: '0.8rem', color: '#65543D', fontStyle: 'italic', marginTop: '0.25rem' }}>
                Balance precision/recall
              </div>
            </div>

            <div className="metric-card" style={{ 
              gridColumn: 'span 2',
              background: '#A64A2A',
              borderColor: '#A64A2A',
              color: '#F0E8D9'
            }}>
              <div className="metric-label" style={{ color: 'rgba(240, 232, 217, 0.8)' }}>
                ROC-AUC Discrimination Score
              </div>
              <div className="metric-value" style={{ color: '#F0E8D9', fontSize: '2.5rem' }}>
                {(metrics.roc_auc * 100).toFixed(2)}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240, 232, 217, 0.7)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                Class separation capability
              </div>
            </div>
          </div>
        </div>

        {/* Feature Information */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <FaLayerGroup style={{ fontSize: '1.3rem', color: '#A64A2A' }} />
            <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', margin: 0 }}>
              Feature Dimensions
            </h3>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.2rem'
          }}>
            <div style={{ 
              background: 'rgba(101, 84, 61, 0.05)',
              border: '1px solid rgba(101, 84, 61, 0.18)',
              padding: '1.2rem',
              borderRadius: '2px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#211A15' }}>
                {features.total}
              </div>
              <div style={{ color: '#65543D', fontSize: '0.8rem', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', marginTop: '0.4rem', fontWeight: '600' }}>
                Total Attributes
              </div>
            </div>

            <div style={{ 
              background: 'rgba(101, 84, 61, 0.05)',
              border: '1px solid rgba(101, 84, 61, 0.18)',
              padding: '1.2rem',
              borderRadius: '2px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#211A15' }}>
                {features.categorical}
              </div>
              <div style={{ color: '#65543D', fontSize: '0.8rem', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', marginTop: '0.4rem', fontWeight: '600' }}>
                Categorical
              </div>
            </div>

            <div style={{ 
              background: 'rgba(101, 84, 61, 0.05)',
              border: '1px solid rgba(101, 84, 61, 0.18)',
              padding: '1.2rem',
              borderRadius: '2px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#211A15' }}>
                {features.numerical}
              </div>
              <div style={{ color: '#65543D', fontSize: '0.8rem', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', marginTop: '0.4rem', fontWeight: '600' }}>
                Numerical
              </div>
            </div>
          </div>
        </div>

        {/* Hyperparameters */}
        {hyperparameters && Object.keys(hyperparameters).length > 0 && (
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', marginBottom: '1.2rem' }}>
              Optimized Hyperparameters
            </h3>
            <div style={{ 
              background: 'rgba(101, 84, 61, 0.05)',
              border: '1px solid rgba(101, 84, 61, 0.18)',
              padding: '1.2rem',
              borderRadius: '2px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(hyperparameters).map(([key, value]) => (
                <div key={key} style={{ 
                  padding: '0.8rem 1rem',
                  background: '#FFFDFC',
                  borderRadius: '2px',
                  border: '1px solid rgba(101, 84, 61, 0.2)'
                }}>
                  <div style={{ 
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.75rem', 
                    color: '#65543D', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '0.25rem'
                  }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ 
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '1.1rem', 
                    fontWeight: '700',
                    color: '#211A15'
                  }}>
                    {typeof value === 'number' ? value.toFixed(4) : value.toString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Technical Details */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
          Technical Implementation
        </h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', color: '#A64A2A', marginBottom: '0.5rem', fontWeight: '600' }}>
              🔧 Data Preprocessing
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.95rem', color: '#65543D', lineHeight: '1.8' }}>
              <li>Label Encoding for string-based categories</li>
              <li>StandardScaler for numerical range normalization</li>
              <li>SMOTE (Synthetic Minority Over-sampling Technique)</li>
              <li>Calculations for customer tenure & charge increases</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', color: '#A64A2A', marginBottom: '0.5rem', fontWeight: '600' }}>
              🎯 Model Training
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.95rem', color: '#65543D', lineHeight: '1.8' }}>
              <li>XGBoost Classifier optimized via Grid Search</li>
              <li>5-Fold Stratified Cross-Validation on train set</li>
              <li>Maximizing ROC-AUC separation metrics</li>
              <li>Hyperparameters tuned to limit variance/overfit</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', color: '#A64A2A', marginBottom: '0.5rem', fontWeight: '600' }}>
              📊 Diagnostic Reports
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.95rem', color: '#65543D', lineHeight: '1.8' }}>
              <li>Complete classification diagnostic tests</li>
              <li>Feature weight calculations and importances</li>
              <li>Predictive probability scale normalization</li>
              <li>Dynamic customer recommendation mapper</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', color: '#A64A2A', marginBottom: '0.5rem', fontWeight: '600' }}>
              🚀 Infrastructure
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.95rem', color: '#65543D', lineHeight: '1.8' }}>
              <li>Flask RESTful Microservices API backend</li>
              <li>React 18 frontend dashboard interface</li>
              <li>Render Blueprint & Docker compose settings</li>
              <li>Fully automated CI/CD pipeline compatibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelInfo;
