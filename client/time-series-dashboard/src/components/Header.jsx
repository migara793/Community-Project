import { FaChartLine } from 'react-icons/fa';

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
        <FaChartLine size={32} />
        <h1>Time Series Forecasting</h1>
      </div>
      <div className="info">
        <span>{currentDate}</span>
      </div>
    </header>
  );
};

export default Header;