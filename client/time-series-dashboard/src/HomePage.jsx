// src/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/Login');
  };

  const goToAdmin = () => {
    navigate('/Demand-Forcast');
  };

  return (
    <div>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navItem} onClick={() => navigate('/')}>Home</div>
        <div style={styles.navItem} onClick={goToAdmin}>Admin</div>
        <button style={styles.loginButton} onClick={goToLogin}>Login</button>
      </nav>

      {/* Cover Section with Image and Text Overlay */}
      <div style={styles.coverContainer}>
        <img src="/image.png" alt="Cover" style={styles.coverImage} />
        <div style={styles.overlayContent}>
          <h1 style={styles.heading}>Web Application for Product Demand Forecasting</h1>
          <p style={styles.subText}>
            C/S Madurapani Praja Mula Co-operative Society,<br />
            Helbodagama, Katukithula.
          </p>
        </div>
      </div>
    </div>
  );
};

// Inline styles
const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#004080',
    padding: '10px 20px',
    color: 'white',
  },
  navItem: {
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  loginButton: {
    backgroundColor: '#ffffff',
    color: '#004080',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  coverContainer: {
    position: 'relative',
    textAlign: 'center',
    color: 'black',
  },
  coverImage: {
    width: '100%',
    height: 'auto',
    opacity: 0.2,
  },
  overlayContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
  },
  heading: {
    fontSize: '50px',
    fontWeight: 'bold',
    marginBottom: '10px',
    
  },
  subText: {
    fontSize: '18px',
    lineHeight: '1.5',
  },
};

export default HomePage;
