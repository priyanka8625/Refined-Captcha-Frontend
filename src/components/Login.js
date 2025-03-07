import React, { useState, useRef, useEffect } from 'react';
import '../assets/css/Login.css';
import aadhar_logo from '../assets/images/aadhar_logo.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [aadharNumber, setAadharNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [mouseMovementCount, setMouseMovementCount] = useState(0);
    const [keystrokeCount, setKeystrokeCount] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());

    const slideSubmitRef = useRef(null);
    const slideThumbRef = useRef(null);

    let navigate = useNavigate()

    // Track mouse movements
    const handleMouseMove = () => {
        setMouseMovementCount(prevCount => prevCount + 1);
    };

    // Track keystrokes
    const handleKeyDown = () => {
        setKeystrokeCount(prevCount => prevCount + 1);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setAadharNumber(value);
        if (/^\d{12}$/.test(value)) {
            slideSubmitRef.current.style.pointerEvents = "auto";
            slideSubmitRef.current.style.opacity = "1";
            setErrorMessage('');
        } else {
            slideSubmitRef.current.style.pointerEvents = "none";
            slideSubmitRef.current.style.opacity = "0.5";
            setErrorMessage('Aadhar number must be exactly 12 digits.');
        }
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const thumbWidth = slideThumbRef.current.offsetWidth;
        const containerWidth = slideSubmitRef.current.offsetWidth;

        const onMouseMove = (e) => {
            let newX = e.clientX - startX;
            if (newX < 0) newX = 0;
            if (newX > containerWidth - thumbWidth) newX = containerWidth - thumbWidth;
            slideThumbRef.current.style.left = newX + 'px';
            if (newX === containerWidth - thumbWidth) {
                slideSubmitRef.current.classList.add('active');
            } else {
                slideSubmitRef.current.classList.remove('active');
            }
        };

        const onMouseUp = async () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            if (slideSubmitRef.current.classList.contains('active')) {
                const endTime = Date.now();
                const timeOnPage = Math.floor((endTime - startTime) / 1000); // Convert milliseconds to seconds
                const userData = {
                    mouseMovementCount,
                    keystrokeCount,
                    timeOnPage,
                    js_enabled:1
                };

                // Log the user data to the console
                console.log('User Interaction Data:', JSON.stringify(userData, null, 2));

                if (/^\d{12}$/.test(aadharNumber)) {
                    try {
                        const response = await fetch('http://127.0.0.1:8000/api/v1/predict/', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(userData),
                        });
                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const result = await response.json();
                        console.log(result)

                        const {probability} = result

                        if (probability <= 0.4) {
                          navigate("/success")

                           
                        } else if (probability > 0.4 && probability <= 0.6) {
                            navigate('/active-captcha');
                        } else {
                            navigate('/active-captcha');
                            setKeystrokeCount(0)
                            setMouseMovementCount(0)
                            setStartTime(Date.now())
                        }

                      } catch (error) {
                        console.error('Error:', error);
                      }
                    
                } else {
                    setErrorMessage('Please enter a valid 12-digit Aadhar number.');
                }
            } else {
                slideThumbRef.current.style.left = '0px';
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!/^\d{12}$/.test(aadharNumber)) {
            setErrorMessage('Please enter a valid 12-digit Aadhar number.');
        }
    };

    return (
        <div className="container">
            <img src={aadhar_logo} alt="Logo" />
            <h1>Aadhar Portal</h1>
            <form id="aadhar-form" onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    id="aadhar-number" 
                    name="aadhar-number" 
                    placeholder="Enter Aadhar Number" 
                    value={aadharNumber} 
                    onChange={handleInputChange} 
                    required 
                />
                <div className="error-message">{errorMessage}</div>
                <div 
                    className="slide-submit" 
                    ref={slideSubmitRef} 
                    style={{ pointerEvents: 'none', opacity: '0.5' }}
                >
                    <div className="slide-submit-text">Slide To Submit </div>
                    <div 
                        className="slide-submit-thumb" 
                        ref={slideThumbRef} 
                        onMouseDown={handleMouseDown}
                    >
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Login;