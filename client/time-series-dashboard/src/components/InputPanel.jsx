import { FaSlidersH, FaCube, FaCalendarAlt, FaCalendarCheck, FaBolt, FaInfoCircle } from 'react-icons/fa';
import { FaChevronDown } from 'react-icons/fa';

const InputPanel = ({
  features,
  selectedFeature,
  onFeatureChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onPredict
}) => {
  return (
    <section className="input-panel">
      <h2><FaSlidersH /> Forecast Parameters</h2>
      
      <div className="form-group">
        <label htmlFor="featureSelect"><FaCube /> Select Feature:</label>
        <div className="select-wrapper">
          <select
            id="featureSelect"
            className="form-control"
            value={selectedFeature}
            onChange={(e) => onFeatureChange(e.target.value)}
          >
            <option value="" disabled>Select a feature</option>
            {features.map(feature => (
              <option key={feature} value={feature}>{feature}</option>
            ))}
          </select>
          <FaChevronDown />
        </div>
      </div>
      
      <div className="date-range">
        <div className="form-group">
          <label htmlFor="startDate"><FaCalendarAlt /> Start Date:</label>
          <input
            type="date"
            id="startDate"
            className="form-control"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endDate"><FaCalendarCheck /> End Date:</label>
          <input
            type="date"
            id="endDate"
            className="form-control"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="form-group">
        <button className="btn predict-btn" onClick={onPredict}>
          <FaBolt /> Generate Forecast
        </button>
      </div>
      
      <div className="info-card">
        <FaInfoCircle size={20} />
        <p>Select a feature and date range to generate forecasts. Predictions start after the last training date.</p>
      </div>
    </section>
  );
};

export default InputPanel;