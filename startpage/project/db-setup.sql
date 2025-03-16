-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS basicauth;

-- Set the search path to the basicauth schema
SET search_path TO basicauth;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create application_links table
CREATE TABLE IF NOT EXISTS application_links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    github_url VARCHAR(255),
    product_homepage VARCHAR(255),
    documentation VARCHAR(255),
    logo_url VARCHAR(255),
    banner_image VARCHAR(255),
    version VARCHAR(50),
    last_updated VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create application_features table
CREATE TABLE IF NOT EXISTS application_features (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES application_links(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create application_screenshots table
CREATE TABLE IF NOT EXISTS application_screenshots (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES application_links(id) ON DELETE CASCADE,
    screenshot_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create application_metrics table
CREATE TABLE IF NOT EXISTS application_metrics (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES application_links(id) ON DELETE CASCADE,
    users INTEGER,
    deployments INTEGER,
    stars INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create application_related table
CREATE TABLE IF NOT EXISTS application_related (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES application_links(id) ON DELETE CASCADE,
    related_application_id INTEGER NOT NULL REFERENCES application_links(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, related_application_id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_links_updated_at
BEFORE UPDATE ON application_links
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO users (username, password_hash, email, is_admin)
VALUES ('admin', '$2a$10$8KzvO7LB.jRTFNHGZRTLpOWVU5Vj9Svt.oK1QYnJ.zPEWGrYWEKYe', 'admin@example.com', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Insert some sample application links
INSERT INTO application_links (
    id, name, url, icon, description, detailed_description, 
    github_url, product_homepage, documentation, version, last_updated
)
VALUES 
(
    '1', 
    'ATLAS', 
    '../atlas', 
    'grid', 
    'Clinical data analytics platform', 
    'ATLAS is an open source software tool developed by the OHDSI community to conduct scientific analyses on standardized observational data. It provides a unified interface for designing and executing observational analyses, including cohort definitions, characterizations, population-level effect estimation, and patient-level prediction.',
    'https://github.com/OHDSI/Atlas',
    'https://www.ohdsi.org/atlas/',
    'https://ohdsi.github.io/Atlas/',
    '2.12.0',
    'March 2025'
),
(
    '2', 
    'ARES', 
    '../ares', 
    'database', 
    'Data quality assessment tool', 
    'ARES (Automated Repository Evaluation System) is a tool for assessing the quality of data in OMOP CDM repositories. It provides a comprehensive framework for evaluating data quality across various dimensions, including conformance, completeness, and plausibility.',
    'https://github.com/OHDSI/Ares',
    'https://www.ohdsi.org/ares/',
    'https://ohdsi.github.io/Ares/',
    '1.5.0',
    'February 2025'
),
(
    '3', 
    'HADES', 
    '../hades', 
    'chart-bar', 
    'Health Analytics Data-to-Evidence Suite', 
    'HADES (Health Analytics Data-to-Evidence Suite) is a collection of R packages for large scale analytics on observational healthcare data. It provides a comprehensive framework for conducting observational research, from data quality assessment to evidence generation.',
    'https://github.com/OHDSI/Hades',
    'https://ohdsi.github.io/Hades/',
    'https://ohdsi.github.io/Hades/packages.html',
    '3.0.0',
    'January 2025'
)
ON CONFLICT (id) DO NOTHING;

-- Insert features for ATLAS
INSERT INTO application_features (application_id, feature)
VALUES 
(1, 'Cohort definition and generation'),
(1, 'Characterization of cohort populations'),
(1, 'Population-level effect estimation'),
(1, 'Patient-level prediction'),
(1, 'Incidence rate analysis'),
(1, 'Visualization of data quality results')
ON CONFLICT DO NOTHING;

-- Insert features for ARES
INSERT INTO application_features (application_id, feature)
VALUES 
(2, 'Automated data quality checks'),
(2, 'Customizable quality thresholds'),
(2, 'Comprehensive reporting'),
(2, 'Integration with ATLAS'),
(2, 'Historical trend analysis'),
(2, 'Data quality dashboards')
ON CONFLICT DO NOTHING;

-- Insert features for HADES
INSERT INTO application_features (application_id, feature)
VALUES 
(3, 'Cohort generation and characterization'),
(3, 'Population-level effect estimation'),
(3, 'Patient-level prediction'),
(3, 'Data quality assessment'),
(3, 'Visualization tools'),
(3, 'Reproducible research workflows')
ON CONFLICT DO NOTHING;

-- Insert metrics for applications
INSERT INTO application_metrics (application_id, users, deployments, stars)
VALUES 
(1, 5000, 120, 450),  -- ATLAS
(2, 3200, 95, 320),   -- ARES
(3, 4500, 110, 380)   -- HADES
ON CONFLICT DO NOTHING;

-- Insert related apps for ATLAS
INSERT INTO application_related (application_id, related_application_id)
VALUES 
(1, 3),
(1, 2)
ON CONFLICT DO NOTHING;

-- Insert related apps for ARES
INSERT INTO application_related (application_id, related_application_id)
VALUES 
(2, 1),
(2, 3)
ON CONFLICT DO NOTHING;

-- Insert related apps for HADES
INSERT INTO application_related (application_id, related_application_id)
VALUES 
(3, 1),
(3, 2)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
