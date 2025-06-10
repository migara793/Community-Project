// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js';
import './App.css';

function App() {
  // State management
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [forecastData, setForecastData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  const [maxValue, setMaxValue] = useState('-');
  const [minValue, setMinValue] = useState('-');
  const [avgChange, setAvgChange] = useState('-');
  
  // Refs
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Load available features on mount
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await axios.get('/get_feature_names');
        setFeatures(response.data.data_columns || []);
      } catch (err) {
        setError('Failed to load features. Please try again later.');
        console.error('Feature load error:', err);
      }
    };
    
    fetchFeatures();
  }, []);

  // Handle prediction request
  const handlePrediction = async () => {
    // Validation
    if (!selectedFeature) {
      setError('Please select a feature');
      return;
    }
    
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Make prediction request
      const formData = new FormData();
      formData.append('feature', selectedFeature);
      formData.append('start_day', startDate);
      formData.append('end_day', endDate);
      
      const response = await axios.post('/predict_price', formData);
      const forecastData = response.data;
      
      // Process data for display
      setForecastData(forecastData);
      processSummaryData(forecastData);
      
      // Render chart
      renderChart(forecastData);
      
    } catch (err) {
      let errorMessage = 'Prediction failed';
      if (err.response?.data?.error) {
        errorMessage += `: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Process data for summary cards
  const processSummaryData = (data) => {
    if (!data || data.length === 0) return;

    let maxValue = -Infinity;
    let minValue = Infinity;
    let previousValue = null;
    let totalChange = 0;
    let changeCount = 0;

    data.forEach((item) => {
      const value = parseFloat(item.predicted_value);
      
      if (value > maxValue) maxValue = value;
      if (value < minValue) minValue = value;
      
      if (previousValue !== null) {
        const change = ((value - previousValue) / previousValue) * 100;
        totalChange += change;
        changeCount++;
      }
      previousValue = value;
    });

    setMaxValue(maxValue.toFixed(2));
    setMinValue(minValue.toFixed(2));
    setAvgChange(changeCount > 0 ? (totalChange / changeCount).toFixed(2) + '%' : '0%');
  };

  // Render chart using Chart.js
  const renderChart = (data) => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    const dates = data.map(item => item.date);
    const values = data.map(item => parseFloat(item.predicted_value));
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: `${selectedFeature} Forecast`,
          data: values,
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#3a56d4',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: 'Value' },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            title: { display: true, text: 'Date' },
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 45 }
          }
        },
        interaction: { intersect: false, mode: 'nearest' },
        animation: { duration: 1000 }
      }
    });
  };

  // Export data to CSV
  const exportToCsv = () => {
    if (!forecastData || forecastData.length === 0) {
      setError('No data to export');
      return;
    }
    
    // Create CSV content
    let csvContent = 'Date,Predicted Value\n';
    forecastData.forEach(item => {
      csvContent += `"${item.date}",${item.predicted_value}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedFeature}_forecast_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table sorting functionality
  const sortTable = (columnIndex) => {
    const sortedData = [...forecastData];
    
    sortedData.sort((a, b) => {
      // Date column
      if (columnIndex === 0) {
        return new Date(a.date) - new Date(b.date);
      }
      
      // Predicted value column
      if (columnIndex === 1) {
        return parseFloat(a.predicted_value) - parseFloat(b.predicted_value);
      }
      
      // Change column (requires calculation)
      if (columnIndex === 2) {
        const aValue = parseFloat(a.predicted_value);
        const bValue = parseFloat(b.predicted_value);
        const aIndex = forecastData.indexOf(a);
        const bIndex = forecastData.indexOf(b);
        
        // Calculate change from previous day
        const aPrev = aIndex > 0 ? parseFloat(forecastData[aIndex - 1].predicted_value) : null;
        const bPrev = bIndex > 0 ? parseFloat(forecastData[bIndex - 1].predicted_value) : null;
        
        const aChange = aPrev ? ((aValue - aPrev) / aPrev) * 100 : 0;
        const bChange = bPrev ? ((bValue - bPrev) / bPrev) * 100 : 0;
        
        return aChange - bChange;
      }
      
      return 0;
    });
    
    setForecastData(sortedData);
  };

  return (
    <div className="dashboard">
      {/* Header Section */}
      <header className="header">
        <div className="logo">
          <i className="fas fa-chart-line"></i>
          <h1>Time Series Forecasting</h1>
        </div>
        <div className="info">
          <span id="current-date">{currentDate}</span>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="content">
        {/* Input Panel */}
        <section className="input-panel">
          <h2><i className="fas fa-sliders-h"></i> Forecast Parameters</h2>
          
          <div className="form-group">
            <label htmlFor="featureSelect"><i className="fas fa-cube"></i> Select Feature:</label>
            <div className="select-wrapper">
              <select 
                id="featureSelect" 
                className="form-control"
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                disabled={isLoading}
              >
                <option value="" disabled>Select a feature</option>
                {features.map(feature => (
                  <option key={feature} value={feature}>{feature}</option>
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
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate"><i className="fas fa-calendar-end"></i> End Date:</label>
              <input 
                type="date" 
                id="endDate" 
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <button 
              id="predictButton" 
              className="btn predict-btn"
              onClick={handlePrediction}
              disabled={isLoading}
            >
              <i className="fas fa-bolt"></i> Generate Forecast
            </button>
          </div>
          
          <div className="info-card">
            <i className="fas fa-info-circle"></i>
            <p>Select a feature and date range to generate forecasts. Predictions start after the last training date.</p>
          </div>
        </section>
        
        {/* Results Panel */}
        <section className="results-panel">
          <div className="panel-header">
            <h2><i className="fas fa-chart-bar"></i> Forecast Results</h2>
            <div className="controls">
              <button 
                id="exportCsv" 
                className="btn export-btn"
                onClick={exportToCsv}
                disabled={forecastData.length === 0 || isLoading}
              >
                <i className="fas fa-file-csv"></i> Export CSV
              </button>
            </div>
          </div>
          
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Generating forecast...</p>
            </div>
          )}
          
          {!isLoading && forecastData.length > 0 && (
            <div id="resultsContainer">
              <div className="chart-container">
                <canvas id="forecastChart" ref={chartRef}></canvas>
              </div>
              
              <div className="summary-cards">
                <div className="card">
                  <div className="card-icon">
                    <i className="fas fa-arrow-up"></i>
                  </div>
                  <div className="card-content">
                    <h3>Max Value</h3>
                    <p>{maxValue}</p>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-icon">
                    <i className="fas fa-arrow-down"></i>
                  </div>
                  <div className="card-content">
                    <h3>Min Value</h3>
                    <p>{minValue}</p>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-icon">
                    <i className="fas fa-percentage"></i>
                  </div>
                  <div className="card-content">
                    <h3>Avg Change</h3>
                    <p>{avgChange}</p>
                  </div>
                </div>
              </div>
              
              <div className="table-container">
                <table id="resultsTable">
                  <thead>
                    <tr>
                      <th onClick={() => sortTable(0)}>Date <i className="fas fa-sort"></i></th>
                      <th onClick={() => sortTable(1)}>Predicted Value <i className="fas fa-sort"></i></th>
                      <th onClick={() => sortTable(2)}>Change <i className="fas fa-sort"></i></th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((item, index) => {
                      const currentValue = parseFloat(item.predicted_value);
                      const prevValue = index > 0 ? parseFloat(forecastData[index - 1].predicted_value) : null;
                      const change = prevValue 
                        ? `${((currentValue - prevValue) / prevValue * 100).toFixed(2)}%` 
                        : '-';
                      
                      return (
                        <tr key={index}>
                          <td>{item.date}</td>
                          <td>{currentValue.toFixed(2)}</td>
                          <td>{change}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error">
              {error}
            </div>
          )}
        </section>
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <p>Time Series Forecasting Dashboard &copy; 2023 | Powered by Prophet</p>
        <div className="system-status">
          <span className="status-indicator active"></span>
          <span>Backend Connected</span>
        </div>
      </footer>
    </div>
  );
}

export default App;