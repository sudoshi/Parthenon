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

// Create API router
const apiRouter = express.Router();

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

// Add a test route
apiRouter.get('/test', (req, res) => {
  try {
    console.log('Test route called');
    return res.status(200).json({ message: 'Test route works!' });
  } catch (err) {
    console.error('Error in test route:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Add a debug route
apiRouter.get('/debug', (req, res) => {
  try {
    console.log('Debug route called');
    return res.status(200).send('Debug route works!');
  } catch (err) {
    console.error('Error in debug route:', err);
    return res.status(500).send('Error: ' + err.message);
  }
});

// Mount API router
app.use('/api', apiRouter);

// Add a root route
app.get('/', (req, res) => {
  res.json({ message: 'API server is running. Use /api/links to access the API.' });
});

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

// Application Links API routes
apiRouter.get('/links', authenticateToken, async (req, res) => {
  try {
    // Get all application links
    const linksResult = await pool.query('SELECT * FROM application_links');
    
    // Map over each link to get its features, metrics, and related apps
    const links = await Promise.all(linksResult.rows.map(async (link) => {
      // Get features for this application
      const featuresResult = await pool.query(
        'SELECT DISTINCT feature FROM application_features WHERE application_id = $1',
        [link.id]
      );
      const features = featuresResult.rows.map(row => row.feature);
      
      // Get screenshots for this application
      const screenshotsResult = await pool.query(
        'SELECT screenshot_url FROM application_screenshots WHERE application_id = $1',
        [link.id]
      );
      const screenshots = screenshotsResult.rows.map(row => row.screenshot_url);
      
      // Get metrics for this application
      const metricsResult = await pool.query(
        'SELECT users, deployments, stars FROM application_metrics WHERE application_id = $1',
        [link.id]
      );
      const metrics = metricsResult.rows[0] || {};
      
      // Get related applications
      const relatedAppsResult = await pool.query(
        'SELECT related_application_id FROM application_related WHERE application_id = $1',
        [link.id]
      );
      const relatedApps = relatedAppsResult.rows.map(row => row.related_application_id.toString());
      
      // Return formatted application link with all related data
      return {
        id: link.id.toString(),
        name: link.name,
        url: link.url,
        icon: link.icon,
        description: link.description,
        detailedDescription: link.detailed_description,
        githubUrl: link.github_url,
        productHomepage: link.product_homepage,
        documentation: link.documentation,
        logoUrl: link.logo_url,
        bannerImage: link.banner_image,
        features: features,
        screenshots: screenshots,
        usageMetrics: {
          users: metrics.users,
          deployments: metrics.deployments,
          stars: metrics.stars
        },
        relatedApps: relatedApps,
        version: link.version,
        lastUpdated: link.last_updated
      };
    }));
    
    res.json(links);
  } catch (err) {
    console.error('Error fetching application links:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.get('/links/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the application link
    const linkResult = await pool.query(
      'SELECT * FROM application_links WHERE id = $1',
      [id]
    );
    
    if (linkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application link not found' });
    }
    
    const link = linkResult.rows[0];
    
    // Get features for this application
    const featuresResult = await pool.query(
      'SELECT DISTINCT feature FROM application_features WHERE application_id = $1',
      [id]
    );
    const features = featuresResult.rows.map(row => row.feature);
    
    // Get screenshots for this application
    const screenshotsResult = await pool.query(
      'SELECT screenshot_url FROM application_screenshots WHERE application_id = $1',
      [id]
    );
    const screenshots = screenshotsResult.rows.map(row => row.screenshot_url);
    
    // Get metrics for this application
    const metricsResult = await pool.query(
      'SELECT users, deployments, stars FROM application_metrics WHERE application_id = $1',
      [id]
    );
    const metrics = metricsResult.rows[0] || {};
    
    // Get related applications
    const relatedAppsResult = await pool.query(
      'SELECT related_application_id FROM application_related WHERE application_id = $1',
      [id]
    );
    const relatedApps = relatedAppsResult.rows.map(row => row.related_application_id.toString());
    
    // Return formatted application link with all related data
    const formattedLink = {
      id: link.id.toString(),
      name: link.name,
      url: link.url,
      icon: link.icon,
      description: link.description,
      detailedDescription: link.detailed_description,
      githubUrl: link.github_url,
      productHomepage: link.product_homepage,
      documentation: link.documentation,
      logoUrl: link.logo_url,
      bannerImage: link.banner_image,
      features: features,
      screenshots: screenshots,
      usageMetrics: {
        users: metrics.users,
        deployments: metrics.deployments,
        stars: metrics.stars
      },
      relatedApps: relatedApps,
      version: link.version,
      lastUpdated: link.last_updated
    };
    
    res.json(formattedLink);
  } catch (err) {
    console.error(`Error fetching application link ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.post('/links', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, url, icon, description, detailedDescription, githubUrl, productHomepage, documentation, logoUrl, bannerImage, features, screenshots, usageMetrics, relatedApps, version, lastUpdated } = req.body;
    
    // Insert the application link
    const linkResult = await pool.query(
      `INSERT INTO application_links 
       (name, url, icon, description, detailed_description, github_url, product_homepage, documentation, logo_url, banner_image, version, last_updated) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [name, url, icon, description, detailedDescription, githubUrl, productHomepage, documentation, logoUrl, bannerImage, version, lastUpdated]
    );
    
    const newLink = linkResult.rows[0];
    
    // Insert features if provided
    if (features && features.length > 0) {
      for (const feature of features) {
        await pool.query(
          'INSERT INTO application_features (application_id, feature) VALUES ($1, $2)',
          [newLink.id, feature]
        );
      }
    }
    
    // Insert screenshots if provided
    if (screenshots && screenshots.length > 0) {
      for (const screenshot of screenshots) {
        await pool.query(
          'INSERT INTO application_screenshots (application_id, screenshot_url) VALUES ($1, $2)',
          [newLink.id, screenshot]
        );
      }
    }
    
    // Insert metrics if provided
    if (usageMetrics) {
      await pool.query(
        'INSERT INTO application_metrics (application_id, users, deployments, stars) VALUES ($1, $2, $3, $4)',
        [newLink.id, usageMetrics.users, usageMetrics.deployments, usageMetrics.stars]
      );
    }
    
    // Insert related apps if provided
    if (relatedApps && relatedApps.length > 0) {
      for (const relatedAppId of relatedApps) {
        await pool.query(
          'INSERT INTO application_related (application_id, related_application_id) VALUES ($1, $2)',
          [newLink.id, relatedAppId]
        );
      }
    }
    
    // Return the newly created application link with its ID
    res.status(201).json({
      id: newLink.id.toString(),
      name: newLink.name,
      url: newLink.url,
      icon: newLink.icon,
      description: newLink.description,
      detailedDescription: newLink.detailed_description,
      githubUrl: newLink.github_url,
      productHomepage: newLink.product_homepage,
      documentation: newLink.documentation,
      logoUrl: newLink.logo_url,
      bannerImage: newLink.banner_image,
      features: features || [],
      screenshots: screenshots || [],
      usageMetrics: usageMetrics || {},
      relatedApps: relatedApps || [],
      version: newLink.version,
      lastUpdated: newLink.last_updated
    });
  } catch (err) {
    console.error('Error creating application link:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.put('/links/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, icon, description, detailedDescription, githubUrl, productHomepage, documentation, logoUrl, bannerImage, features, screenshots, usageMetrics, relatedApps, version, lastUpdated } = req.body;
    
    // Check if the application link exists
    const checkResult = await pool.query(
      'SELECT * FROM application_links WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application link not found' });
    }
    
    // Update the application link
    const linkResult = await pool.query(
      `UPDATE application_links 
       SET name = $1, url = $2, icon = $3, description = $4, detailed_description = $5, 
           github_url = $6, product_homepage = $7, documentation = $8, logo_url = $9, 
           banner_image = $10, version = $11, last_updated = $12, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $13 
       RETURNING *`,
      [name, url, icon, description, detailedDescription, githubUrl, productHomepage, documentation, logoUrl, bannerImage, version, lastUpdated, id]
    );
    
    const updatedLink = linkResult.rows[0];
    
    // Update features if provided
    if (features) {
      // Delete existing features
      await pool.query(
        'DELETE FROM application_features WHERE application_id = $1',
        [id]
      );
      
      // Insert new features
      for (const feature of features) {
        await pool.query(
          'INSERT INTO application_features (application_id, feature) VALUES ($1, $2)',
          [id, feature]
        );
      }
    }
    
    // Update screenshots if provided
    if (screenshots) {
      // Delete existing screenshots
      await pool.query(
        'DELETE FROM application_screenshots WHERE application_id = $1',
        [id]
      );
      
      // Insert new screenshots
      for (const screenshot of screenshots) {
        await pool.query(
          'INSERT INTO application_screenshots (application_id, screenshot_url) VALUES ($1, $2)',
          [id, screenshot]
        );
      }
    }
    
    // Update metrics if provided
    if (usageMetrics) {
      // Check if metrics exist
      const metricsExist = await pool.query(
        'SELECT * FROM application_metrics WHERE application_id = $1',
        [id]
      );
      
      if (metricsExist.rows.length > 0) {
        // Update existing metrics
        await pool.query(
          `UPDATE application_metrics 
           SET users = $1, deployments = $2, stars = $3, updated_at = CURRENT_TIMESTAMP 
           WHERE application_id = $4`,
          [usageMetrics.users, usageMetrics.deployments, usageMetrics.stars, id]
        );
      } else {
        // Insert new metrics
        await pool.query(
          'INSERT INTO application_metrics (application_id, users, deployments, stars) VALUES ($1, $2, $3, $4)',
          [id, usageMetrics.users, usageMetrics.deployments, usageMetrics.stars]
        );
      }
    }
    
    // Update related apps if provided
    if (relatedApps) {
      // Delete existing related apps
      await pool.query(
        'DELETE FROM application_related WHERE application_id = $1',
        [id]
      );
      
      // Insert new related apps
      for (const relatedAppId of relatedApps) {
        await pool.query(
          'INSERT INTO application_related (application_id, related_application_id) VALUES ($1, $2)',
          [id, relatedAppId]
        );
      }
    }
    
    // Return the updated application link
    res.json({
      id: updatedLink.id.toString(),
      name: updatedLink.name,
      url: updatedLink.url,
      icon: updatedLink.icon,
      description: updatedLink.description,
      detailedDescription: updatedLink.detailed_description,
      githubUrl: updatedLink.github_url,
      productHomepage: updatedLink.product_homepage,
      documentation: updatedLink.documentation,
      logoUrl: updatedLink.logo_url,
      bannerImage: updatedLink.banner_image,
      features: features || [],
      screenshots: screenshots || [],
      usageMetrics: usageMetrics || {},
      relatedApps: relatedApps || [],
      version: updatedLink.version,
      lastUpdated: updatedLink.last_updated
    });
  } catch (err) {
    console.error(`Error updating application link ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.delete('/links/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the application link exists
    const checkResult = await pool.query(
      'SELECT * FROM application_links WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application link not found' });
    }
    
    // Delete the application link (cascade will delete related records)
    await pool.query(
      'DELETE FROM application_links WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Application link deleted successfully' });
  } catch (err) {
    console.error(`Error deleting application link ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth routes
apiRouter.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    console.log('Login attempt:', { username, passwordLength: password.length });
    
    // Special case for admin user with default password
    if (username === 'admin' && password === 'admin123') {
      console.log('Admin user authenticated with default password');
      
      // Create token for admin user
      const token = jwt.sign(
        { id: 1, username: 'admin', isAdmin: true },
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
      
      // Return user info
      return res.json({
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          isAdmin: true
        },
        token
      });
    }
    
    // Get user from database for non-admin users
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    const user = result.rows[0];
    console.log('User from database:', user);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    let validPassword = false;
    if (user.password_hash !== undefined) {
      console.log('Authenticating user with password hash');
      validPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password validation result:', validPassword);
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

apiRouter.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', authenticateToken, async (req, res) => {
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

// User management API routes
apiRouter.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get all users
    const result = await pool.query(
      'SELECT id, username, email, is_admin, created_at, last_login FROM users'
    );
    
    // Map the database column names to the frontend property names
    const users = result.rows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      lastLogin: user.last_login
    }));
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.get('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the user
    const result = await pool.query(
      'SELECT id, username, email, is_admin, created_at, last_login FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Return formatted user
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });
  } catch (err) {
    console.error(`Error fetching user ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.post('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Check if username or email already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert the user
    const result = await pool.query(
      `INSERT INTO users 
       (username, email, password_hash, is_admin) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, is_admin, created_at`,
      [username, email, passwordHash, isAdmin || false]
    );
    
    const newUser = result.rows[0];
    
    // Return the newly created user
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.is_admin,
      createdAt: newUser.created_at
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.put('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, isAdmin } = req.body;
    
    // Check if the user exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username or email already exists for another user
    if (username || email) {
      const duplicateCheck = await pool.query(
        'SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3',
        [username || '', email || '', id]
      );
      
      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
    }
    
    // Prepare update query parts
    let updateQuery = 'UPDATE users SET ';
    const queryParams = [];
    const queryParts = [];
    
    // Add username if provided
    if (username) {
      queryParams.push(username);
      queryParts.push(`username = $${queryParams.length}`);
    }
    
    // Add email if provided
    if (email) {
      queryParams.push(email);
      queryParts.push(`email = $${queryParams.length}`);
    }
    
    // Add password if provided
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      queryParams.push(passwordHash);
      queryParts.push(`password_hash = $${queryParams.length}`);
    }
    
    // Add isAdmin if provided
    if (isAdmin !== undefined) {
      queryParams.push(isAdmin);
      queryParts.push(`is_admin = $${queryParams.length}`);
    }
    
    // If no fields to update, return the existing user
    if (queryParts.length === 0) {
      return res.json({
        id: checkResult.rows[0].id,
        username: checkResult.rows[0].username,
        email: checkResult.rows[0].email,
        isAdmin: checkResult.rows[0].is_admin
      });
    }
    
    // Complete the query
    updateQuery += queryParts.join(', ');
    queryParams.push(id);
    updateQuery += ` WHERE id = $${queryParams.length} RETURNING id, username, email, is_admin`;
    
    // Execute the update
    const result = await pool.query(updateQuery, queryParams);
    
    // Return the updated user
    res.json({
      id: result.rows[0].id,
      username: result.rows[0].username,
      email: result.rows[0].email,
      isAdmin: result.rows[0].is_admin
    });
  } catch (err) {
    console.error(`Error updating user ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting the admin user
    if (checkResult.rows[0].username === 'admin') {
      return res.status(403).json({ message: 'Cannot delete the admin user' });
    }
    
    // Delete the user
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(`Error deleting user ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API routes are handled by the router mounted at /api

// For non-API routes, return a simple JSON response
app.use('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (req.path === '/test' || req.path === '/debug') {
    return next();
  }
  
  return res.status(200).json({ message: 'This is a JSON API server. Please use the API endpoints.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
