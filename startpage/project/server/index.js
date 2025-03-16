const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN || 'https://omop.acumenus.net' : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'host.docker.internal',
  database: process.env.DB_NAME || 'ohdsi',
  password: process.env.DB_PASSWORD || 'acumenus',
  port: process.env.DB_PORT || 5432,
  schema: 'basicauth'
});

// Log database connection details
console.log('Database connection details:');
console.log(`  Host: ${process.env.DB_HOST || 'host.docker.internal'}`);
console.log(`  Database: ${process.env.DB_NAME || 'ohdsi'}`);
console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
console.log(`  Port: ${process.env.DB_PORT || 5432}`);

// Set the search path to the basicauth schema
pool.on('connect', (client) => {
  client.query('SET search_path TO basicauth');
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  
  next();
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    const user = result.rows[0];
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    let validPassword = false;
    if (user.password_hash !== undefined) {
      console.log('Authenticating user');
      validPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      console.error('No password_hash column found in users table');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Return user info (without password)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin
    };
    
    res.json({
      user: userResponse,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, is_admin FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
