require("dotenv").config();
global.fetch = require("cross-fetch");
const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "http://localhost:54321";
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.warn("⚠️  Missing Supabase anon key - running in development mode");
}

let supabase = null;
if (supabaseKey && !supabaseKey.includes('example')) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "public" },
    global: { fetch: fetch },
  });
} else {
  console.log("⚠️  Supabase client not initialized - using development mode");
}

const testConnection = async (retries = 3) => {
  if (!supabase || !supabaseKey || supabaseKey.includes('example')) {
    console.log("⚠️  Skipping database connection test - using development mode");
    return true;
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.from("organizations").select("count");
      if (error) throw error;
      console.log("✅ Successfully connected to Supabase!");
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.warn("⚠️  Continuing without database connection");
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from React app build
app.use(express.static(path.join(__dirname, "build")));

// Serve React app for any non-API routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Test Supabase connection
app.get("/test-db", async (req, res) => {
  if (!supabase) {
    return res.json({ 
      success: false, 
      error: "Supabase not configured", 
      message: "Running in development mode without database connection" 
    });
  }
  
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .limit(1);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update test connection endpoint
app.get("/api/test-connection", async (req, res) => {
  if (!supabase) {
    return res.json({ 
      status: "development", 
      message: "Running in development mode without database connection" 
    });
  }
  
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .limit(1);

    if (error) throw error;
    res.json({ status: "connected", data });
  } catch (error) {
    console.error("Connection error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      url: supabaseUrl,
    });
  }
});

// Authentication endpoints for user registration/login
app.post("/api/auth/register", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: "Database not available", 
      message: "Running in development mode without database connection" 
    });
  }
  
  try {
    const { auth0_id, email, name, picture, email_verified } = req.body;

    if (!auth0_id || !email) {
      return res
        .status(400)
        .json({ error: "Missing required fields: auth0_id and email" });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("auth0_id", auth0_id)
      .single();

    if (existingUser) {
      return res.json({ message: "User already exists", user: existingUser });
    }

    // Create new user
    const { data, error } = await supabase
      .from("users")
      .insert({
        auth0_id,
        email,
        name,
        picture,
        email_verified: email_verified || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "User created successfully", user: data });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ error: "Failed to register user", details: error.message });
  }
});

// Get user profile
app.get("/api/auth/user/:auth0_id", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: "Database not available", 
      message: "Running in development mode without database connection" 
    });
  }
  
  try {
    const { auth0_id } = req.params;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth0_id", auth0_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "User not found" });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get user error:", error);
    res
      .status(500)
      .json({ error: "Failed to get user", details: error.message });
  }
});

// Update user profile
app.put("/api/auth/user/:auth0_id", async (req, res) => {
  try {
    const { auth0_id } = req.params;
    const updates = req.body;

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("auth0_id", auth0_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "User updated successfully", user: data });
  } catch (error) {
    console.error("Update user error:", error);
    res
      .status(500)
      .json({ error: "Failed to update user", details: error.message });
  }
});

// Sync user (upsert operation)
app.post("/api/auth/sync", async (req, res) => {
  try {
    const { auth0_id, email, name, picture, email_verified } = req.body;

    if (!auth0_id || !email) {
      return res
        .status(400)
        .json({ error: "Missing required fields: auth0_id and email" });
    }

    const { data, error } = await supabase
      .from("users")
      .upsert({
        auth0_id,
        email,
        name,
        picture,
        email_verified: email_verified || false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "User synced successfully", user: data });
  } catch (error) {
    console.error("Sync user error:", error);
    res
      .status(500)
      .json({ error: "Failed to sync user", details: error.message });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Start server with connection verification
const server = app.listen(port, async () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔍 API test: http://localhost:${port}/test-db`);

  // Test database connection on startup
  await testConnection();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server shutdown complete");
  });
});
