import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import CSS file for styling
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import GoogleAuth from './GoogleAuth';

const LoginPage = () => {
    const [userid, setUserid] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = Cookies.get('token');
        if (isLoggedIn) {
            navigate('/patients');
        }
    }, []);

    const toastify = (message, error) => {
        if (error == false) {
            toast.success(message, {
                position: 'top-right'
            });
        } else {
            toast.error(message, {
                position: 'top-right'
            });
        }
    }

    const handleLogin = async e => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', userid);
        formData.append('password', password);

        try {
            const response = await fetch(`http://localhost:8000/token`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.access_token) {
                setUserid('');
                setPassword('');
                toastify("Login successfully", false);
                setTimeout(() => {
                    window.location.href = "/patients"
                    Cookies.set('token', data.access_token, { expires: 1 });
                }, 200);
            } else {
                toastify(data.detail || data.error, true);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error creating user:', error);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group-login">
                    <label htmlFor="userid">User ID</label>
                    <input
                        type="text"
                        id="userid"
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group-login">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
                <div style={{width: '100%', marginTop: '5%', display: 'flex', justifyContent: 'center'}}>
                    <GoogleAuth />
                </div>
            </form>
            <ToastContainer />
        </div>
    );
};

export default LoginPage;
