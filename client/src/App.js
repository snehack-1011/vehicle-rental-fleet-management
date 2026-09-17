import React from 'react';
import Login from './components/Authentication/Login';
import Register from './components/Authentication/Register';
import Dashboard from './Frontend2/Dashboard';

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>
        Customer Portal
      </h1>

      <Login />

      <hr style={{ margin: '40px 0' }} />

      <Register />

      <hr style={{ margin: '40px 0' }} />

      <Dashboard />
    </div>
  );
}

export default App;