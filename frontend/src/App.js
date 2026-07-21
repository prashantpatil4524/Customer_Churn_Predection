import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import PredictionForm from './components/PredictionForm';
import ResultsDisplay from './components/ResultsDisplay';
import ModelInfo from './components/ModelInfo';
import BatchPrediction from './components/BatchPrediction';
import { FaChartLine, FaRobot, FaBrain, FaDatabase } from 'react-icons/fa';

function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [predictionResult, setPredictionResult] = useState(null);
  
  // Curtain Splitter State
  const [leftWidth, setLeftWidth] = useState(50); // percentage for the left form panel
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handlePredictionComplete = (result) => {
    setPredictionResult(result);
    // Automatically adjust split to 50/50 when result is first loaded
    setLeftWidth(50);
  };

  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const percentage = (relativeX / rect.width) * 100;
      // Constraint split width between 30% and 70%
      if (percentage >= 30 && percentage <= 70) {
        setLeftWidth(percentage);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const stopDrag = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', stopDrag);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [isDragging]);

  return (
    <div className="App">
      {/* Header with Japanese Eaves Background */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <FaBrain className="logo-icon" />
            <h1>Silk Atlas Churn</h1>
          </div>
          <p className="subtitle">AI-Powered Customer Retention Analytics</p>
        </div>
      </header>

      {/* Navigation styled like editorial tabs */}
      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
        >
          <FaChartLine /> Single Prediction
        </button>
        <button
          className={`nav-button ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          <FaDatabase /> Batch Prediction
        </button>
        <button
          className={`nav-button ${activeTab === 'model' ? 'active' : ''}`}
          onClick={() => setActiveTab('model')}
        >
          <FaRobot /> Model Info
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="app-main">
        <div className="content-container">
          {activeTab === 'predict' && (
            <div className="tab-content">
              <div className="intro-section">
                <h2>Predict Customer Churn</h2>
                <p>
                  Enter customer information below to predict churn probability and receive
                  personalized retention recommendations powered by machine learning.
                </p>
              </div>
              
              <div 
                className="prediction-layout" 
                ref={containerRef}
                style={{ cursor: isDragging ? 'col-resize' : 'default' }}
              >
                {/* Left Panel: Form */}
                <div 
                  className="form-section" 
                  style={{ width: predictionResult ? `${leftWidth}%` : '100%' }}
                >
                  <PredictionForm onPredictionComplete={handlePredictionComplete} />
                </div>
                
                {/* Sliding Splitter Handle (Only visible when result exists) */}
                {predictionResult && (
                  <div 
                    className={`curtain-splitter ${isDragging ? 'dragging' : ''}`} 
                    onMouseDown={startDrag}
                    onTouchStart={startDrag}
                  >
                    <div className="curtain-handle-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                
                {/* Right Panel: Results */}
                {predictionResult && (
                  <div 
                    className="results-section" 
                    style={{ width: `${100 - leftWidth}%` }}
                  >
                    <ResultsDisplay result={predictionResult} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'batch' && (
            <div className="tab-content">
              <div className="intro-section">
                <h2>Batch Prediction</h2>
                <p>
                  Upload a CSV file or paste JSON data to predict churn for multiple
                  customers at once. Perfect for analyzing large customer segments.
                </p>
              </div>
              <BatchPrediction />
            </div>
          )}

          {activeTab === 'model' && (
            <div className="tab-content">
              <div className="intro-section">
                <h2>Model Information</h2>
                <p>
                  View detailed information about the machine learning model, including
                  performance metrics, features, and hyperparameters.
                </p>
              </div>
              <ModelInfo />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>Silk Atlas Customer Churn Prediction System</p>
          <p>Powered by XGBoost & React | Industry-Standard ML Pipeline</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
