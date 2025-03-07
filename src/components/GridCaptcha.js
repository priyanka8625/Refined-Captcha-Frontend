import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GridCaptcha() {
  const [shapes, setShapes] = useState([]);
  const [selectedDots, setSelectedDots] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [inputKeys, setInputKeys] = useState('');
  const [captchaCompleted, setCaptchaCompleted] = useState(false);
  const [requiredKeys, setRequiredKeys] = useState('');
  const [timer, setTimer] = useState(30); // 30-second timer

  const [mouseMovements, setMouseMovements] = useState([]);
  const [startTime, setStartTime] = useState(null);

  const navigate = useNavigate();
  const gridSize = 4;
  const totalCircles = 2;
  const keyOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  
  const shapeTypes = ['square', 'triangle', 'hexagon'];

  useEffect(() => {
    const generateRandomShapes = () => {
      let newShapes = Array(gridSize * gridSize).fill(null);

      // Decide the pattern: 0 = both circles, 1 = one circle + one circle text, 2 = one circle text + one circle, 3 = both circle text
      const patternType = Math.floor(Math.random() * 4);

      let circleIndices = [];
      while (circleIndices.length < totalCircles) {
        let randomIndex = Math.floor(Math.random() * newShapes.length);
        if (!circleIndices.includes(randomIndex)) {
          circleIndices.push(randomIndex);
        }
      }

      newShapes = newShapes.map((shape, index) => {
        if (index === circleIndices[0]) {
          return patternType === 1 ? 'circle-text' : 'circle';
        }
        if (index === circleIndices[1]) {
          return patternType === 2 ? 'circle-text' : 'circle';
        }
        if (patternType === 3 && (index === circleIndices[0] || index === circleIndices[1])) {
          return 'circle-text';
        }
        return shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      });

      setShapes(newShapes);
    };

    const generateRandomKeys = () => {
      const randomKeys = Array.from({ length: 5 }, () => 
        keyOptions.charAt(Math.floor(Math.random() * keyOptions.length))
      ).join('');
      setRequiredKeys(randomKeys);
    };

    generateRandomShapes();
    generateRandomKeys();
    setStartTime(Date.now()); // Capture the start time when the CAPTCHA is displayed

    const countdown = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          navigate('/');
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [navigate]);

  // Capture mouse movements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseMovements((prevMovements) => [
        ...prevMovements,
        { x: e.clientX, y: e.clientY, time: Date.now() - startTime }
      ]);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [startTime]);

  const handleDotClick = (index) => {
    if (shapes[index] === 'circle' || shapes[index] === 'circle-text') {
      if (selectedDots.length < 2 && !selectedDots.includes(index)) {
        setSelectedDots([...selectedDots, index]);
        console.log(`Dot ${index + 1} selected`);
      }

      if (selectedDots.length === 1 && !selectedDots.includes(index)) {
        setIsConnected(true);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputKeys(e.target.value);
  };

  const handleSubmit = () => {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Calculate time taken in seconds
  
    // Bot detection algorithm
    const analyzeMouseMovements = (movements) => {
      let speedVariations = [];
      let timeIntervals = [];
      let straightLineCount = 0;
    
      for (let i = 1; i < movements.length; i++) {
        const dx = movements[i].x - movements[i - 1].x;
        const dy = movements[i].y - movements[i - 1].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const timeDelta = movements[i].time - movements[i - 1].time;
    
        if (timeDelta > 0) {
          const speed = distance / timeDelta;
          speedVariations.push(speed);
          timeIntervals.push(timeDelta);
        }
    
        // Check if movement is a straight line
        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
          straightLineCount++;
        }
      }
    
      const avgSpeed = speedVariations.reduce((a, b) => a + b, 0) / speedVariations.length;
      const avgTimeInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
    
      const speedVariance = speedVariations.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / speedVariations.length;
      const timeVariance = timeIntervals.reduce((sum, t) => sum + Math.pow(t - avgTimeInterval, 2), 0) / timeIntervals.length;
    
      // New condition to check if average time interval exceeds 15 seconds
      const isHuman = speedVariance > 0.02 && timeVariance > 100 && straightLineCount < movements.length * 0.75 && avgTimeInterval <= 15000;
    
      return isHuman;
    };
    
    const isHuman = analyzeMouseMovements(mouseMovements);
  
    if (isConnected && inputKeys === requiredKeys && isHuman) {
      console.log("CAPTCHA passed: Detected as human.");
        navigate("/success")

      setCaptchaCompleted(true);
    } else {
      console.log("CAPTCHA failed: Detected as bot.");
    }
  
    // Log mouse movements and time taken
    console.log('Mouse Movements:', mouseMovements);
    console.log('Time Taken to Solve CAPTCHA:', timeTaken, 'seconds');
    console.log('Human Detection Result:', isHuman ? 'Human' : 'Bot');
  };

  const handleCopy = (e) => {
    e.preventDefault();
    console.log("Copy action prevented");
  };

  const renderShape = (shape, index) => {
    const shapeStyles = {
      circle: styles.circle,
      // 'circle-text': styles.circleText,
      square: styles.square,
      triangle: styles.triangle,
      hexagon: styles.hexagon,
    };

    return (
      <div
        key={index}
        style={shapeStyles[shape]}
        onClick={() => handleDotClick(index)}
      >
        {shape === 'circle-text' && 'Circle'}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src="aadhar_logo.png" alt="Logo" style={styles.logo} />
      </header>
      <div style={styles.captchaContainer}>
        <h2>Connect the Circle</h2>
        <div style={styles.gridContainer(gridSize)}>
          {shapes.map((shape, index) => renderShape(shape, index))}
          {isConnected && selectedDots.length === 2 && (
            <svg style={styles.lineContainer}>
              <line
                x1={((selectedDots[0] % gridSize) * 60) + 30}
                y1={Math.floor(selectedDots[0] / gridSize) * 60 + 30}
                x2={((selectedDots[1] % gridSize) * 60) + 30}
                y2={Math.floor(selectedDots[1] / gridSize) * 60 + 30}
                stroke="black"
                strokeWidth="2"
              />
            </svg>
          )}
        </div>

        {isConnected && (
          <div>
            <h3>Enter the following key combination: '{requiredKeys}'</h3>
            <input
              type="text"
              value={inputKeys}
              onChange={handleInputChange}
              placeholder="Enter the key combination"
              style={styles.input}
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isConnected || inputKeys !== requiredKeys}
          style={styles.submitButton}
        >
          Submit CAPTCHA
        </button>

        {captchaCompleted && <p>CAPTCHA passed!</p>}

        <div>
          <p>Time remaining: {timer} seconds</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  header: {
    marginBottom: '20px',
  },
  logo: {
    width: '150px',
  },
  captchaContainer: {
    maxWidth: '500px',
    width: '100%',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  gridContainer: (size) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, 50px)`,
    gridTemplateRows: `repeat(${size}, 50px)`,
    gap: '10px',
    marginBottom: '20px',
    position: 'relative',
  }),
  circle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'gray',
    cursor: 'pointer',
  },
  circleText: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'gray',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  square: {
    width: '50px',
    height: '50px',
    backgroundColor: 'red',
    cursor: 'pointer',
  },
  triangle: {
    width: '0',
    height: '0',
    borderLeft: '25px solid transparent',
    borderRight: '25px solid transparent',
    borderBottom: '50px solid green',
    cursor: 'pointer',
  },
  hexagon: {
    width: '50px',
    height: '50px',
    backgroundColor: 'blue',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    cursor: 'pointer',
  },
  input: {
    display: 'block',
    margin: '10px 0',
    padding: '5px',
    fontSize: '16px',
  },
  lineContainer: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    border: 'none',
    color: 'white',
    padding: '10px 12px',
    textAlign: 'center',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
  },
};

export default GridCaptcha;
