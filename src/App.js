import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css';
import Login from './components/Login';
import Success from './components/Success';
import GridCaptcha from './components/GridCaptcha';

function App() {
  return (
    <>
    <Router>
      
      <Routes>
        <Route exact path='/' element={<Login />} />
        <Route exact path='/success' element={<Success />} />
        <Route exact path='/active-captcha' element={<GridCaptcha />} />
      </Routes>
      </Router>
    </>
  );
}

export default App;
