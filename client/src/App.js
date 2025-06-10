import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import Footer from './components/Footer';
import { getFeatures, predictPrice } from './services/api';
import './App.css';

function App() {
  const [features, setFeatures] = useState([]);
  const [feature, setFeature] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryStats, setSummaryStats] = useState({
    maxValue: 0,
    minValue: 0,
    avgChange: 0
  });

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const featuresData = await getFeatures();
        setFeatures(featuresData);
      } catch (err) {
        setError('Failed to load features');
        console.error('Feature load error:', err);
      }
    };
    
    loadFeatures();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await predictPrice(feature, startDate, endDate);
      setForecastData(data);
      calculateSummaryStats(data);
    } catch (err) {
      setError(err.message || 'Prediction failed');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryStats = (data) => {
    if (!data || data.length === 0) return;
    
    const values = data.map(item => item.predicted_value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    let totalChange = 0;
    let changeCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      const change = ((data[i].predicted_value - data[i-1].predicted_value) / 
                    data[i-1].predicted_value) * 100;
      totalChange += change;
      changeCount++;
    }
    
    setSummaryStats({
      maxValue,
      minValue,
      avgChange: changeCount > 0 ? totalChange / changeCount : 0
    });
  };

  const handleExport = () => {
    if (!forecastData || forecastData.length === 0) {
      setError('No data to export');
      return;
    }
    
    let csvContent = 'Date,Predicted Value\n';
    forecastData.forEach(item => {
      csvContent += `"${item.date}",${item.predicted_value}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${feature}_forecast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard">
      <Header />
      <main className="content">
        <InputPanel 
          features={features} 
          feature={feature}
          startDate={startDate}
          endDate={endDate}
          onFeatureChange={(e) => setFeature(e.target.value)}
          onStartDateChange={(e) => setStartDate(e.target.value)}
          onEndDateChange={(e) => setEndDate(e.target.value)}
          onSubmit={handlePredict}
          isPredicting={loading}
        />
        <ResultsPanel 
          data={forecastData} 
          feature={feature} 
          loading={loading} 
          error={error}
          onExport={handleExport}
          summaryStats={summaryStats}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;