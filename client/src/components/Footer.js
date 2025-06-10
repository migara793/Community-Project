import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <p>Time Series Forecasting Dashboard &copy; {new Date().getFullYear()} | Powered by Prophet</p>
      <div className="system-status">
        <span className="status-indicator active"></span>
        <span>Backend Connected</span>
      </div>
    </footer>
  );
};

export default Footer;