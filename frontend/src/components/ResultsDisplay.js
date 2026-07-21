import React, { useState, useEffect } from 'react';
import { getRecommendations } from '../services/api';
import { FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaSyncAlt } from 'react-icons/fa';

const ResultsDisplay = ({ result }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const { churn, churn_probability, confidence, risk_level } = result;
  const churnPercent = (churn_probability * 100).toFixed(1);
  const noChurnPercent = ((1 - churn_probability) * 100).toFixed(1);

  // SVG Gauge Calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (churn_probability * circumference);

  useEffect(() => {
    if (churn) {
      fetchRecommendations();
    } else {
      setRecommendations(null); // Clear recommendations if no churn risk
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churn]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const recs = await getRecommendations(result.customerData || {});
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      'Low': '#2E6F40',      // Sage green
      'Medium': '#D48F38',   // Ochre
      'High': '#A64A2A',     // Terracotta
      'Critical': '#A64A2A'  // Terracotta
    };
    return colors[level] || '#A64A2A';
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

  const getProgressClass = (level) => {
    const levelMap = {
      'Low': 'progress-low',
      'Medium': 'progress-medium',
      'High': 'progress-high',
      'Critical': 'progress-critical'
    };
    return levelMap[level] || 'progress-medium';
  };

  return (
    <div className="results-container slide-in">
      {/* Main Result Card */}
      <div className="result-card">
        <div className="result-header">
          <h3 className="result-title">Analysis Verdict</h3>
          <span className={`risk-badge ${getRiskClass(risk_level)}`}>
            {risk_level} Risk
          </span>
        </div>

        {/* Dynamic Churn Status */}
        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          {churn ? (
            <div>
              <FaExclamationTriangle 
                style={{ fontSize: '3rem', color: '#A64A2A', marginBottom: '0.5rem' }} 
              />
              <h2 style={{ 
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                color: '#A64A2A', 
                fontSize: '2rem', 
                fontWeight: '600',
                marginBottom: '0.25rem' 
              }}>
                Retention Warning
              </h2>
              <p style={{ color: '#65543D', fontStyle: 'italic', fontSize: '1rem' }}>
                Customer has a high probability of terminating service.
              </p>
            </div>
          ) : (
            <div>
              <FaCheckCircle 
                style={{ fontSize: '3rem', color: '#2E6F40', marginBottom: '0.5rem' }} 
              />
              <h2 style={{ 
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                color: '#2E6F40', 
                fontSize: '2rem', 
                fontWeight: '600',
                marginBottom: '0.25rem' 
              }}>
                Stable Account
              </h2>
              <p style={{ color: '#65543D', fontStyle: 'italic', fontSize: '1rem' }}>
                Customer is currently showing healthy loyalty signals.
              </p>
            </div>
          )}
        </div>

        {/* SVG Radial Progress Circle */}
        <div className="radial-score-container">
          <svg width="150" height="150">
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="rgba(101, 84, 61, 0.15)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke={getRiskColor(risk_level)}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 75 75)"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="radial-score-center">
            <span className="radial-score-val">{churnPercent}%</span>
            <span className="radial-score-lbl">Risk</span>
          </div>
        </div>

        {/* Probability Ruler */}
        <div className="progress-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.4rem',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: '#65543D'
          }}>
            <span>CHURN SCALE</span>
            <span>{churnPercent}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className={`progress-fill ${getProgressClass(risk_level)}`}
              style={{ width: `${churnPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Churn Risk</div>
            <div className="metric-value" style={{ color: getRiskColor(risk_level) }}>
              {churnPercent}%
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Stability</div>
            <div className="metric-value" style={{ color: '#2E6F40' }}>
              {noChurnPercent}%
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Confidence</div>
            <div className="metric-value">
              {(confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Card */}
      {churn && (
        <div className="result-card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(101, 84, 61, 0.2)',
            paddingBottom: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaLightbulb style={{ fontSize: '1.3rem', color: '#D48F38' }} />
              <h3 className="result-title" style={{ fontSize: '1.4rem' }}>Retention Interventions</h3>
            </div>
            {!loadingRecs && (
              <button 
                onClick={fetchRecommendations}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#65543D',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'ui-monospace, monospace'
                }}
              >
                <FaSyncAlt /> REFRESH
              </button>
            )}
          </div>

          {loadingRecs ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="loading-spinner"></span>
              <p style={{ marginTop: '1rem', color: '#65543D', fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem' }}>
                Analyzing account drivers...
              </p>
            </div>
          ) : recommendations && recommendations.recommendations ? (
            <div className="recommendations-list">
              {recommendations.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-header">
                    <span className="recommendation-category">{rec.category}</span>
                    <span className={`priority-badge priority-${rec.priority.toLowerCase()}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p style={{ color: '#211A15', fontSize: '1rem', lineHeight: '1.6', margin: '0.5rem 0' }}>
                    {rec.message}
                  </p>
                  <div style={{ 
                    marginTop: '0.4rem', 
                    fontSize: '0.8rem', 
                    color: '#65543D',
                    fontFamily: 'ui-monospace, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Impact: {rec.impact}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              <span>ℹ️</span>
              <span>No recommendations generated. Check connection to backend.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
