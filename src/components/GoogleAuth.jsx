import React, { useState, useEffect } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const GoogleAuth = () => {
    const [googleClient, setGoogleClient] = useState("");

    useEffect(() => {
        setGoogleClient(process.env.REACT_APP_GOOGLE_CLIENT);
    }, []);

    const toastify = (message, error) => {
        if (error == false) {
            toast.success(message, {
                position: 'top-right',
            });
        } else {
            toast.error(message, {
                position: 'top-right',
            });
        }
    }
    
    const handleGoogleLogin = async (name, email)  => {
        const formData = { username: name, email: email, password: '', status: 'Hold', role: 'user' };
        console.log(formData)

        try {
            const response = await fetch('http://localhost:8000/users/google_login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.detail || data.error) {
                toastify(data.detail || data.error, true);
            } else {
                toastify("User Login successful", false);
                setTimeout(() => {
                    window.location.href = "/patients"
                    Cookies.set('token', data.access_token, { expires: 1 });
                }, 200);
            }
        } catch (error) {
            toastify(error, true);
            console.error('Error logging in:', error);
        }
    };

    return (
        <>
            <GoogleOAuthProvider clientId={googleClient}>
                <GoogleLogin
                    onSuccess={credentialResponse => {
                        const decoded = jwtDecode(credentialResponse.credential);
                        handleGoogleLogin(decoded.name, decoded.email);
                    }}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                />;
            </GoogleOAuthProvider>;
        </>
    )
}

export default GoogleAuth