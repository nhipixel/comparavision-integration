require('dotenv').config();
global.fetch = require('cross-fetch');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001; // Changed from 3000 to 3001

// Enhanced error handling for Supabase connection
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Missing Supabase anon key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    fetch: fetch
  }
});

// Test connection function with retry
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.from('organizations').select('count');
      if (error) throw error;
      console.log('Successfully connected to Supabase!');
      return true;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Test Supabase connection
app.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update test connection endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    res.json({ status: 'connected', data });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      url: supabaseUrl 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server with connection verification
const server = app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  
  // Test database connection on startup
  try {
    const { data, error } = await supabase.from('organizations').select('count');
    if (error) throw error;
    console.log('Successfully connected to Supabase!');
  } catch (error) {
    console.error('Failed to connect to Supabase:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shutdown complete');
  });
});
