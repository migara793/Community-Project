import React from 'react';
import { FaFacebookF, FaYoutube } from 'react-icons/fa';

const FooterHome = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-title">C/S Madurapani Praja Mula Co-operative Society</p>
        <div className="footer-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="icon">
            <FaFacebookF />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="icon">
            <FaYoutube />
          </a>
        </div>
        <p className="footer-copy">© 2025 All rights reserved</p>
      </div>

      <style jsx>{`
        .footer {
          background-color:rgb(93, 89, 89);
          color: #f0f0f0;
          padding: 0px 20px;
          text-align: center;
        }

        .footer-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .footer-title {
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0px;
        }

        .footer-icons {
          margin: 0px 0;
        }

        .icon {
          color: #ffffff;
          margin: 0 10px;
          font-size: 24px;
          transition: color 0.3s ease;
        }

        .icon:hover {
          color: #ff0000;
        }

        .footer-copy {
          font-size: 0.7rem;
          opacity: 0.8;
        }
      `}</style>
    </footer>
  );
};

export default FooterHome;