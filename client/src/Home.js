import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import HomePage from './HomePage';
import LoginPage from './components/LoginPage';

const Home = () => {

 

  return (
     <Routes>
      <Route path="/" element={< HomePage/>} />
      <Route path="/Demand-Forcast" element={<App />} />
      <Route path="/Login" element={<LoginPage />} />



    </Routes>
  );
};

export default Home;