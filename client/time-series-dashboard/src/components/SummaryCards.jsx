import { FaArrowUp, FaArrowDown, FaPercentage } from 'react-icons/fa';

const SummaryCards = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Calculate statistics
  const values = data.map(item => parseFloat(item.predicted_value));
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  let totalChange = 0;
  let changeCount = 0;
  let previousValue = null;
  
  values.forEach(value => {
    if (previousValue !== null) {
      totalChange += ((value - previousValue) / previousValue * 100);
      changeCount++;
    }
    previousValue = value;
  });
  
  const avgChange = changeCount > 0 ? (totalChange / changeCount).toFixed(2) : 0;

  return (
    <div className="summary-cards">
      <div className="card">
        <div className="card-icon">
          <FaArrowUp />
        </div>
        <div className="card-content">
          <h3>Max Value</h3>
          <p>{maxValue.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-icon">
          <FaArrowDown />
        </div>
        <div className="card-content">
          <h3>Min Value</h3>
          <p>{minValue.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-icon">
          <FaPercentage />
        </div>
        <div className="card-content">
          <h3>Avg Change</h3>
          <p>{avgChange}%</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;