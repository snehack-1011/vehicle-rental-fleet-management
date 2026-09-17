import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        password: '',
        role: 'CUSTOMER'
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong during registration.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">🚗</div>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join FleetConnect and start your journey</p>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label className="auth-label">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          className="auth-input"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Ananya"
                          required
                        />
                    </div>
                    
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
                        <label className="auth-label">Account Type</label>
                        <select 
                          name="role" 
                          className="auth-input auth-select"
                          value={formData.role} 
                          onChange={handleChange}
                        >
                            <option value="CUSTOMER">Customer (Rent Vehicles)</option>
                            <option value="FLEET_MANAGER">Fleet Manager</option>
                            <option value="ADMIN">System Admin</option>
                        </select>
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
                        Sign Up →
                    </button>
                </form>

                <Link to="/login" className="auth-link">
                    Already have an account? <strong>Log In</strong>
                </Link>
            </div>
        </div>
    );
};

export default Register;
