import React from 'react';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="header">
      <div className="logo">
        <i className="fas fa-chart-line"></i>
        <h1>Time Series Forecasting</h1>
      </div>
      <div className="info">
        <span>{currentDate}</span>
      </div>
    </header>
  );
};

export default Header;