import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.result));
            
            const userRole = data.result.role;
            if (userRole === 'CUSTOMER') window.location.href = '/customer';
            else if (userRole === 'FLEET_MANAGER') window.location.href = '/fleet';
            else if (userRole === 'ADMIN') window.location.href = '/admin';
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please check your credentials.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🚗</div>
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Log in to FleetConnect to manage your rentals</p>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label className="auth-label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="auth-input"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="ananyaa962@gmail.com"
                          required
                        />
                    </div>
                    <div className="auth-form-group">
                        <label className="auth-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              className="auth-input"
                              value={formData.password}
                              onChange={handleChange}
                              placeholder="••••••••"
                              required
                            />
                            <span 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '16px', top: '15px', cursor: 'pointer', fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="auth-button">
                        Sign In →
                    </button>
                </form>

                <Link to="/register" className="auth-link">
                    Don't have an account? <strong>Create one</strong>
                </Link>
            </div>
        </div>
    );
};

export default Login;