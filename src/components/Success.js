import React from 'react';

const Success = () => {
  return (
    <div style={styles.successPage}>
      <header style={styles.header}>
        <h1>Unique Identification Authority of India</h1>
      </header>

      <div style={styles.mainContent}>
        <h2 style={styles.title}>Welcome to myAadhaar</h2>
        <p style={styles.message}>Login Successful!!!</p>

        <div style={styles.loginBox}>
           <img src='aadhar_logo.png' alt='logo'></img>
         
        </div>
      </div>

      <footer style={styles.footer}>
        <p>© Unique Identification Authority of India. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  successPage: {
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    color: '#fff',
    backgroundColor: '#0a2b5b',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundSize: 'cover',       // Ensure the background covers the entire window
    backgroundRepeat: 'no-repeat', // Prevent background repetition
  },
  header: {
    padding: '20px',
    backgroundColor: '#003366',
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    padding: '20px',
  },
  title: {
    fontSize: '36px',
    marginBottom: '10px',
  },
  message: {
    fontSize: '20px',
    marginBottom: '30px',
  },
  loginBox: {
    display: 'inline-block',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    color: '#000',
  },
  fingerprintIcon: {
    marginBottom: '20px',
  },
  loginButton: {
    backgroundColor: '#0a7ed1',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  footer: {
    backgroundColor: '#003366',
    padding: '10px',
  },
};

export default Success;
