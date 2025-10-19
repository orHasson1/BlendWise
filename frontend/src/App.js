import React, { useState } from 'react';
import Login from './Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <h1>Welcome!</h1>
      <button onClick={() => { setToken(null); localStorage.removeItem('token'); }}>Logout</button>
      {/* Add your protected content here */}
    </div>
  );
}

export default App;