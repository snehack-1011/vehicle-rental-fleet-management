
import React from 'react';
import Login from './components/Authentication/Login';
import Register from './components/Authentication/Register';

function App() {
  return (
    <div className="App">
      <h1 style={{textAlign: 'center', marginTop: '20px' }}>Customer Portal</h1>
      <Login />
      <hr style={{ margin: '40px 0' }}/>
      <Register />
    </div>
  );
}

export default App;