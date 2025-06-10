import { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';

const Chart = ({ data, feature }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const dates = data.map(item => item.date);
    const values = data.map(item => parseFloat(item.predicted_value));

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: `${feature} Forecast`,
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
          legend: {
            position: 'top',
          },
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

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, feature]);

  return <div className="chart-container"><canvas ref={chartRef} /></div>;
};

export default Chart;