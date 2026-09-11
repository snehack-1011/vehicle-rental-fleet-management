import React, { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Register Submitted:', formData);
    };

    return (
        <div style={{ maxwidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Customer Registration</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Full Name:</label>
                    <input
                      type = "text"
                      name = "fullName"
                      value = {formData.fullName}
                      onChange = {handleChange}
                      required
                      style={{ width: '100%', padding: '8px', marginTop: '8px' }}
                      />
                </div>
                <div style ={{ marginBottom: '10px' }}>
                    <label>Email Address:</label>
                    <input
                      type = "email"
                      name = "email"
                      value = {formData.email}
                      onChnage = {handleChange}
                      required
                      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                      />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Phone Number:</label>
                    <input
                      type = "tel"
                      name = "phone"
                      value = {formData.phone}
                      onChnage = {handleChange}
                      required
                      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                      />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Driving License Number:</label>
                    <input
                      type = "text"
                      name = "licenseNumber"
                      value = {formData.licenseNumber}
                      onChange = {handleChange}
                      required
                      style={{ width: "100%", padding: '8px', marginTop: '5px' }}
                      />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label>
                    <input
                      type = "password"
                      name = "password"
                      value = {formData.password}
                      onChange = {handleChange}
                      required
                      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                      />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border:'none', borderRadius: '4px' }}>
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
