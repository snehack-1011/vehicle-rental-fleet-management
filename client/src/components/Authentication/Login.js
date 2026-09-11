import React, { useState } from 'react';
const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login Submitted:', formData);
    };

    return (
        <div style={{ maxwidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h1>Customer Login</h1>
            <form onSubmit={handleSubmit}>
                <div style={{marginBottom: '15px' }}>
                    <label>Email Address:</label>
                    <input
                      type = "email"
                      name = "email"
                      value = {formData.email}
                      onChange = {handleChange}
                      required
                      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div stye={{marginBottom: '15px' }}>
                    <label>Password:</label>
                    <input 
                      type = "password"
                      name = "password"
                      value = {formData.password}
                      onchange = {handleChange}
                      required
                      style={{width: '100%', padding: '8px', marginTop: '5px' }}
                      />
                </div>
                <button type="submit" style={{ width: "100%", padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px'}}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;