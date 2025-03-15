-- SQL script to create databases and users for new Broadsea services

-- For Authentik
CREATE USER authentik WITH PASSWORD '4hkfPHHZ0is7wCc8sDDTrA==';
CREATE DATABASE authentik OWNER authentik;

-- For DataHub
CREATE USER datahub WITH PASSWORD 'o0zpJOwrA9Tt5AVNIpKiJw==';
CREATE DATABASE datahub OWNER datahub;

-- For Superset
CREATE USER superset WITH PASSWORD 'ESA372qdCyYWIf4tDvG0bQ==';
CREATE DATABASE superset OWNER superset;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE authentik TO authentik;
GRANT ALL PRIVILEGES ON DATABASE datahub TO datahub;
GRANT ALL PRIVILEGES ON DATABASE superset TO superset;
