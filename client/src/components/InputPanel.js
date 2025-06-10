import React from 'react';

const InputPanel = ({ 
  features, 
  feature, 
  startDate, 
  endDate, 
  onFeatureChange, 
  onStartDateChange, 
  onEndDateChange, 
  onSubmit,
  isPredicting
}) => {
  return (
    <section className="input-panel">
      <h2><i className="fas fa-sliders-h"></i> Forecast Parameters</h2>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="featureSelect"><i className="fas fa-cube"></i> Select Feature:</label>
          <div className="select-wrapper">
            <select 
              id="featureSelect" 
              className="form-control"
              value={feature}
              onChange={onFeatureChange}
              disabled={isPredicting}
              required
            >
              <option value="" disabled>Select a feature</option>
              {features.map(feat => (
                <option key={feat} value={feat}>{feat}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
        
        <div className="date-range">
          <div className="form-group">
            <label htmlFor="startDate"><i className="fas fa-calendar-start"></i> Start Date:</label>
            <input 
              type="date" 
              id="startDate" 
              className="form-control"
              value={startDate}
              onChange={onStartDateChange}
              disabled={isPredicting}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate"><i className="fas fa-calendar-end"></i> End Date:</label>
            <input 
              type="date" 
              id="endDate" 
              className="form-control"
              value={endDate}
              onChange={onEndDateChange}
              disabled={isPredicting}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <button 
            type="submit" 
            className="btn predict-btn"
            disabled={isPredicting}
          >
            <i className="fas fa-bolt"></i> 
            {isPredicting ? 'Generating...' : 'Generate Forecast'}
          </button>
        </div>
      </form>
      
      <div className="info-card">
        <i className="fas fa-info-circle"></i>
        <p>Select a feature and date range to generate forecasts. Predictions start after the last training date.</p>
      </div>
    </section>
  );
};

export default InputPanel;