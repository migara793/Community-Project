import React, { useState } from 'react';
import ForecastChart from './ForecastChart';

const ResultsPanel = ({ 
  data, 
  feature, 
  loading, 
  error, 
  onExport,
  summaryStats 
}) => {
  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: 'ascending' 
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!data) return [];
    
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortConfig.key) {
          case 'date':
            valueA = new Date(a.date);
            valueB = new Date(b.date);
            break;
          case 'value':
            valueA = a.predicted_value;
            valueB = b.predicted_value;
            break;
          case 'change':
            const indexA = data.indexOf(a);
            const indexB = data.indexOf(b);
            valueA = indexA > 0 
              ? ((a.predicted_value - data[indexA-1].predicted_value) / 
                 data[indexA-1].predicted_value) * 100
              : 0;
            valueB = indexB > 0 
              ? ((b.predicted_value - data[indexB-1].predicted_value) / 
                 data[indexB-1].predicted_value) * 100
              : 0;
            break;
          default:
            return 0;
        }
        
        if (valueA < valueB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  };

  const sortedData = getSortedData();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Generating forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    );
  }

  return (
    <section className="results-panel">
      <div className="panel-header">
        <h2><i className="fas fa-chart-bar"></i> Forecast Results</h2>
        <div className="controls">
          <button onClick={onExport} className="btn export-btn">
            <i className="fas fa-file-csv"></i> Export CSV
          </button>
        </div>
      </div>

      {data && data.length > 0 ? (
        <>
          <div className="chart-container">
            <ForecastChart data={data} feature={feature} />
          </div>
          
          <div className="summary-cards">
            <div className="card">
              <div className="card-icon">
                <i className="fas fa-arrow-up"></i>
              </div>
              <div className="card-content">
                <h3>Max Value</h3>
                <p>{summaryStats.maxValue.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-icon">
                <i className="fas fa-arrow-down"></i>
              </div>
              <div className="card-content">
                <h3>Min Value</h3>
                <p>{summaryStats.minValue.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-icon">
                <i className="fas fa-percentage"></i>
              </div>
              <div className="card-content">
                <h3>Avg Change</h3>
                <p>{summaryStats.avgChange.toFixed(2)}%</p>
              </div>
            </div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => requestSort('date')}>
                    Date <i className="fas fa-sort"></i>
                    {sortConfig.key === 'date' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                    )}
                  </th>
                  <th onClick={() => requestSort('value')}>
                    Predicted Value <i className="fas fa-sort"></i>
                    {sortConfig.key === 'value' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                    )}
                  </th>
                  <th onClick={() => requestSort('change')}>
                    Change <i className="fas fa-sort"></i>
                    {sortConfig.key === 'change' && (
                      <i className={`fas fa-sort-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => {
                  const change = index > 0 
                    ? (((item.predicted_value - data[index-1].predicted_value) / 
                       data[index-1].predicted_value) * 100).toFixed(2)
                    : '-';
                  
                  return (
                    <tr key={`${item.date}-${index}`}>
                      <td>{item.date}</td>
                      <td>{item.predicted_value.toFixed(2)}</td>
                      <td>{change !== '-' ? `${change}%` : change}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="info-card">
          <i className="fas fa-info-circle"></i>
          <p>Select parameters and generate a forecast to see results</p>
        </div>
      )}
    </section>
  );
};

export default ResultsPanel;