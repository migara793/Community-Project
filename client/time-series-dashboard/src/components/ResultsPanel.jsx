import { useState } from 'react';
import { FaChartBar, FaFileCsv } from 'react-icons/fa';
import Chart from './Chart';
import SummaryCards from './SummaryCards';
import DataTable from './DataTable';

const ResultsPanel = ({ forecastData, selectedFeature, loading, error }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleExport = () => {
    if (!forecastData || forecastData.length === 0) return;

    let csvContent = 'Date,Predicted Value\n';
    forecastData.forEach(item => {
      csvContent += `"${item.date}",${item.predicted_value}\n`;
    });

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

  if (loading) {
    return (
      <section className="results-panel">
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating forecast...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="results-panel">
        <div className="error">{error}</div>
      </section>
    );
  }

  if (!forecastData) {
    return null;
  }

  return (
    <section className="results-panel">
      <div className="panel-header">
        <h2><FaChartBar /> Forecast Results</h2>
        <div className="controls">
          <button className="btn export-btn" onClick={handleExport}>
            <FaFileCsv /> Export CSV
          </button>
        </div>
      </div>
      
      <Chart data={forecastData} feature={selectedFeature} />
      <SummaryCards data={forecastData} />
      <DataTable data={forecastData} sortConfig={sortConfig} onSort={setSortConfig} />
    </section>
  );
};

export default ResultsPanel;