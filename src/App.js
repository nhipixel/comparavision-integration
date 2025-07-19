import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { supabase } from './lib/supabase';
import './App.css';

function App() {
  const { loginWithRedirect, logout } = useAuth0();
  const { user, supabaseUser, isAuthenticated, isLoading, error } = useSupabaseAuth();
  const [status, setStatus] = React.useState('checking...');

  React.useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.from('users').select('count');
        if (error) throw error;
        setStatus('connected');
      } catch (error) {
        setStatus('connection failed');
        console.error(error);
      }
    }
    checkConnection();
  }, []);

  if (isLoading) return <div className="loading">Loading...</div>;

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="error-section">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <p>Please check your Supabase configuration.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Auth0 + Supabase Demo</h1>
        
        {!isAuthenticated ? (
          <div className="login-section">
            <h2>Welcome!</h2>
            <p>Please log in to access your profile and database.</p>
            <button 
              className="login-btn"
              onClick={() => loginWithRedirect()}
            >
              Log In with Auth0
            </button>
          </div>
        ) : (
          <div className="profile-section">
            <h2>Welcome back, {user.name}!</h2>
            <div className="user-info">
              <img 
                src={user.picture} 
                alt="Profile" 
                className="profile-picture"
              />
              <div className="user-details">
                <h3>Auth0 Data:</h3>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Email Verified:</strong> {user.email_verified ? '✅' : '❌'}</p>
                
                {supabaseUser && (
                  <>
                    <h3>Supabase Data:</h3>
                    <p><strong>Database ID:</strong> {supabaseUser.id}</p>
                    <p><strong>Auth0 ID:</strong> {supabaseUser.auth0_id}</p>
                    <p><strong>Last Updated:</strong> {new Date(supabaseUser.updated_at).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className="success">✅ Synced with Supabase</span></p>
                  </>
                )}
              </div>
            </div>
            <button 
              className="logout-btn"
              onClick={() => logout({ 
                logoutParams: { returnTo: window.location.origin }
              })}
            >
              Log Out
            </button>
          </div>
        )}
        <p>Connection status: {status}</p>
      </header>
    </div>
  );
}

export default App;