import React, { useState } from 'react';
import { predictChurn } from '../services/api';
import { FaPaperPlane } from 'react-icons/fa';

const PredictionForm = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState({
    gender: 'Male',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',
    tenure: 1,
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'DSL',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 50.0,
    TotalCharges: 50.0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'SeniorCitizen' || name === 'tenure' || 
              name === 'MonthlyCharges' || name === 'TotalCharges' 
              ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await predictChurn(formData);
      onPredictionComplete(result);
    } catch (err) {
      setError(err.message || 'Failed to get prediction');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ 
        fontFamily: 'Cormorant Garamond, Georgia, serif', 
        fontSize: '1.75rem', 
        marginBottom: '1.5rem', 
        color: '#211A15',
        fontWeight: '600'
      }}>
        Customer Profile Input
      </h3>
      
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Demographics */}
        <h4 className="form-section-title">Demographic Profile</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Senior Citizen</label>
            <select name="SeniorCitizen" value={formData.SeniorCitizen} onChange={handleChange}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Has Partner</label>
            <select name="Partner" value={formData.Partner} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Has Dependents</label>
            <select name="Dependents" value={formData.Dependents} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        {/* Section 2: Account details */}
        <h4 className="form-section-title">Account & Financials</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Tenure (months)</label>
            <input
              type="number"
              name="tenure"
              value={formData.tenure}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>

          <div className="form-group">
            <label>Monthly Charges ($)</label>
            <input
              type="number"
              name="MonthlyCharges"
              value={formData.MonthlyCharges}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Total Charges ($)</label>
            <input
              type="number"
              name="TotalCharges"
              value={formData.TotalCharges}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        {/* Section 3: Subscribed Services */}
        <h4 className="form-section-title">Subscribed Services</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Phone Service</label>
            <select name="PhoneService" value={formData.PhoneService} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Multiple Lines</label>
            <select name="MultipleLines" value={formData.MultipleLines} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No phone service">No phone service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Internet Service</label>
            <select name="InternetService" value={formData.InternetService} onChange={handleChange}>
              <option value="DSL">DSL</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Online Security</label>
            <select name="OnlineSecurity" value={formData.OnlineSecurity} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Online Backup</label>
            <select name="OnlineBackup" value={formData.OnlineBackup} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Device Protection</label>
            <select name="DeviceProtection" value={formData.DeviceProtection} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tech Support</label>
            <select name="TechSupport" value={formData.TechSupport} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Streaming TV</label>
            <select name="StreamingTV" value={formData.StreamingTV} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Streaming Movies</label>
            <select name="StreamingMovies" value={formData.StreamingMovies} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>
        </div>

        {/* Section 4: Billing Details */}
        <h4 className="form-section-title">Contract & Billing</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Contract Term</label>
            <select name="Contract" value={formData.Contract} onChange={handleChange}>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          <div className="form-group">
            <label>Paperless Billing</label>
            <select name="PaperlessBilling" value={formData.PaperlessBilling} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Payment Method</label>
            <select name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange}>
              <option value="Electronic check">Electronic check</option>
              <option value="Mailed check">Mailed check</option>
              <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
              <option value="Credit card (automatic)">Credit card (automatic)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
          style={{ marginTop: '2.5rem' }}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              <span>Running Analysis...</span>
            </>
          ) : (
            <>
              <FaPaperPlane />
              <span>Analyze Churn Risk</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;
