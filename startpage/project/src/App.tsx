import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Settings, Grid, Shield, Database, BarChart as ChartBar, Server, Plus, X, Edit2, Save, Image, 
  Clock, Search, Activity, FileSearch, Wind, LayoutDashboard, Github, Home, MessageSquare, Check, 
  ExternalLink, Calendar, Star, Users, Package, LogIn, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { appLinksApi } from './services/api';
import LoginPage from './LoginPage';
import AdminPage from './AdminPage';

interface AppLink {
  id: string;
  name: string;
  url: string;
  learnMoreUrl?: string;
  icon: string;
  description: string;
  logoUrl?: string;
  // New fields for detailed information
  detailedDescription?: string;
  githubUrl?: string;
  productHomepage?: string;
  features?: string[];
  documentation?: string;
  // New fields for visual elements
  bannerImage?: string;
  screenshots?: string[];
  usageMetrics?: {
    users?: number;
    deployments?: number;
    stars?: number;
  };
  relatedApps?: string[];
  version?: string;
  lastUpdated?: string;
}

// RequireAuth component to protect routes
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// HomePage component that renders the main content
const HomePage: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppLink | null>(null);
  
  const openModal = (app: AppLink) => {
    setSelectedApp(app);
  };

  const closeModal = () => {
    setSelectedApp(null);
  };
  
  const [newLink, setNewLink] = useState<AppLink>({
    id: '',
    name: '',
    url: '',
    learnMoreUrl: '',
    icon: 'grid',
    description: '',
    logoUrl: ''
  });

  // Load application links from API
  const [links, setLinks] = useState<AppLink[]>([]);
  
  // Fetch application links from API on component mount
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const linksData = await appLinksApi.getLinks();
        if (linksData && linksData.length > 0) {
          setLinks(linksData);
        } else {
          // Use default links if API returns empty
          setLinks([
            {
              id: '1',
              name: 'ATLAS',
              url: '../atlas',
              icon: 'grid',
              description: 'ATLAS is an open source software tool for researchers to conduct scientific analyses on standardized observational data converted to the OMOP Common Data Model V5.',
              detailedDescription: 'ATLAS is an open source software tool developed by the OHDSI community to conduct scientific analyses on standardized observational data. It provides a unified interface for designing and executing observational analyses, including cohort definitions, characterizations, population-level effect estimation, and patient-level prediction.',
              githubUrl: 'https://github.com/OHDSI/Atlas',
              productHomepage: 'https://www.ohdsi.org/atlas/',
              documentation: 'https://ohdsi.github.io/Atlas/',
              features: [
                'Cohort definition and generation',
                'Characterization of cohort populations',
                'Population-level estimation of causal effects',
                'Patient-level prediction of outcomes',
                'Incidence rate analysis',
                'Visualization of data quality results'
              ],
              version: '2.12.0',
              lastUpdated: 'March 2025',
              relatedApps: ['3', '10'],
              usageMetrics: {
                users: 5000,
                deployments: 120,
                stars: 450
              }
            },
            {
              id: '2',
              name: 'ARES',
              url: '../ares',
              icon: 'database',
              description: 'ARES is a web-based reporting tool designed to offer integrated characterization and data quality assessment for observational health data.',
              detailedDescription: 'ARES is a web-based reporting tool designed to offer integrated characterization and data quality assessment for observational health data sources adhering to the OMOP Common Data Model. It provides access to analyses for a network of observational health data sources, as well as detailed data source and historical analyses, enabling informed decision-making based on reliable data.',
              githubUrl: 'https://github.com/OHDSI/Ares',
              productHomepage: 'https://www.ohdsi.org/ares/',
              documentation: 'https://ohdsi.github.io/Ares/',
              features: [
                'Automated data quality checks',
                'Customizable quality thresholds',
                'Comprehensive reporting',
                'Integration with ATLAS',
                'Historical trend analysis',
                'Data quality dashboards'
              ],
              version: '1.5.0',
              lastUpdated: 'February 2025',
              relatedApps: ['1', '10'],
              usageMetrics: {
                users: 3200,
                deployments: 95,
                stars: 320
              }
            },
            {
              id: '3',
              name: 'HADES',
              url: '../hades',
              icon: 'chart-bar',
              description: 'HADES is a set of open source R packages for large scale analytics.',
              detailedDescription: 'HADES (formally known as the OHDSI Methods Library) is a set of open source R packages for large scale analytics, including population characterization, population-level causal effect estimation, and patient-level prediction. The packages offer R functions that together can be used to perform an observation study from data to estimates and supporting statistics, figures, and tables.',
              githubUrl: 'https://github.com/OHDSI/Hades',
              productHomepage: 'https://ohdsi.github.io/Hades/',
              documentation: 'https://ohdsi.github.io/Hades/packages.html',
              features: [
                'Cohort generation and characterization',
                'Population-level effect estimation',
                'Patient-level prediction',
                'Data quality assessment',
                'Visualization tools',
                'Reproducible research workflows'
              ],
              version: '3.0.0',
              lastUpdated: 'January 2025',
              relatedApps: ['1', '2'],
              usageMetrics: {
                users: 4500,
                deployments: 110,
                stars: 380
              }
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch application links:', err);
      }
    };
    
    fetchLinks();
  }, []);

  const getIcon = (iconName: string) => {
    const icons = {
      'grid': <Grid />,
      'database': <Database />,
      'chart-bar': <ChartBar />,
      'shield': <Shield />,
      'server': <Server />,
      'settings': <Settings />,
      'search': <Search />,
      'activity': <Activity />,
      'file-search': <FileSearch />,
      'wind': <Wind />,
      'layout-dashboard': <LayoutDashboard />,
      'github': <Github />,
      'home': <Home />,
      'message-square': <MessageSquare />,
      'check': <Check />,
      'external-link': <ExternalLink />,
      'calendar': <Calendar />,
      'star': <Star />,
      'users': <Users />,
      'package': <Package />
    };
    return icons[iconName as keyof typeof icons] || <Grid />;
  };

  const handleAddLink = async () => {
    if (newLink.name && newLink.url) {
      try {
        // Call API to create new link
        const createdLink = await appLinksApi.createLink(newLink);
        setLinks([...links, createdLink]);
        setNewLink({
          id: '',
          name: '',
          url: '',
          learnMoreUrl: '',
          icon: 'grid',
          description: '',
          logoUrl: ''
        });
        setIsEditing(false);
      } catch (err) {
        console.error('Failed to create application link:', err);
      }
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      // Call API to delete link
      await appLinksApi.deleteLink(id);
      setLinks(links.filter(link => link.id !== id));
    } catch (err) {
      console.error(`Failed to delete application link ${id}:`, err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 bg-mesh text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 pb-24 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="h-16">
            <img src="/assets/Acumenus-Logo-Rounded.png" alt="Acumenus Logo" className="h-full object-contain" />
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-4 py-2 rounded-lg glass-card hover:bg-opacity-20 hover:bg-white transition-all duration-300 flex items-center"
                  >
                    <Users size={18} className="mr-2" />
                    Admin
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg glass-card hover:bg-opacity-20 hover:bg-white transition-all duration-300 flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add Application
                </button>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 rounded-lg glass-card hover:bg-opacity-20 hover:bg-white transition-all duration-300 flex items-center"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg glass-card hover:bg-opacity-20 hover:bg-white transition-all duration-300 flex items-center"
              >
                <LogIn size={18} className="mr-2" />
                Login
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map(link => (
            <div
              key={link.id}
              className="glass-card rounded-xl p-6 transform hover:-translate-y-2 hover:translate-x-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-opacity-20 bg-white">
                    {link.logoUrl ? (
                      <img 
                        src={link.logoUrl} 
                        alt={`${link.name} logo`} 
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.style.display = 'none';
                          const iconContainer = e.currentTarget.parentElement;
                          if (iconContainer) {
                            iconContainer.appendChild(getIcon(link.icon) as any);
                          }
                        }}
                      />
                    ) : (
                      getIcon(link.icon)
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{link.name}</h2>
                    <p className="text-gray-300 text-sm">{link.description}</p>
                  </div>
                </div>
                {isAuthenticated && isAdmin && (
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openModal(link)}
                  className="flex-1 text-center py-2 glass-card hover:bg-white hover:bg-opacity-10 transition-all duration-300 rounded-lg"
                >
                  Learn More
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
                >
                  Launch
                </a>
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-modal rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Add New Application</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Application Name"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 focus:bg-opacity-20 transition-all duration-300"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 focus:bg-opacity-20 transition-all duration-300"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 focus:bg-opacity-20 transition-all duration-300"
                />
                <select
                  value={newLink.icon}
                  onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 focus:bg-opacity-20 transition-all duration-300"
                >
                  <option value="grid">Grid</option>
                  <option value="database">Database</option>
                  <option value="chart-bar">Chart</option>
                  <option value="shield">Shield</option>
                  <option value="server">Server</option>
                  <option value="settings">Settings</option>
                  <option value="search">Search</option>
                  <option value="activity">Activity</option>
                  <option value="file-search">File Search</option>
                  <option value="wind">Wind</option>
                  <option value="layout-dashboard">Dashboard</option>
                </select>
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddLink}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 glass-card hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 glass-card p-4 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <p className="text-gray-300">© 2025 Acumenus. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a 
              href="https://www.ohdsi.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Home size={20} className="mr-2" />
              <span>OHDSI Home</span>
            </a>
            <a 
              href="https://discord.gg/ohdsi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <MessageSquare size={20} className="mr-2" />
              <span>Discord</span>
            </a>
            <a 
              href="https://github.com/OHDSI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Github size={20} className="mr-2" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-modal rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Banner Image Section */}
            <div className="relative h-48 overflow-hidden rounded-t-xl">
              {selectedApp.bannerImage ? (
                <img 
                  src={selectedApp.bannerImage} 
                  alt={`${selectedApp.name} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900 flex items-center justify-center">
                  <div className="p-6 rounded-full bg-white bg-opacity-10">
                    {getIcon(selectedApp.icon)}
                  </div>
                </div>
              )}
              
              {/* Floating App Info Card */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 backdrop-blur-sm p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-white bg-opacity-10">
                    {selectedApp.logoUrl ? (
                      <img 
                        src={selectedApp.logoUrl} 
                        alt={`${selectedApp.name} logo`} 
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.style.display = 'none';
                          const iconContainer = e.currentTarget.parentElement;
                          if (iconContainer) {
                            iconContainer.appendChild(getIcon(selectedApp.icon) as any);
                          }
                        }}
                      />
                    ) : (
                      getIcon(selectedApp.icon)
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                    {selectedApp.version && (
                      <div className="text-sm text-gray-300 flex items-center">
                        <span className="mr-2">Version {selectedApp.version}</span>
                        {selectedApp.lastUpdated && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Updated {selectedApp.lastUpdated}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-6 overflow-y-auto">
              {/* Usage Metrics */}
              {selectedApp.usageMetrics && (
                <div className="flex justify-around mb-6 p-4 glass-card rounded-lg">
                  {selectedApp.usageMetrics.users && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-blue-400">{selectedApp.usageMetrics.users.toLocaleString()}</div>
                      <div className="text-sm text-gray-300">Active Users</div>
                    </div>
                  )}
                  {selectedApp.usageMetrics.deployments && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-green-400">{selectedApp.usageMetrics.deployments.toLocaleString()}</div>
                      <div className="text-sm text-gray-300">Deployments</div>
                    </div>
                  )}
                  {selectedApp.usageMetrics.stars && (
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-yellow-400">{selectedApp.usageMetrics.stars.toLocaleString()}</div>
                      <div className="text-sm text-gray-300">GitHub Stars</div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">About</h3>
                <p className="text-gray-200 leading-relaxed">
                  {selectedApp.detailedDescription || selectedApp.description}
                </p>
              </div>
              
              {/* Screenshots Carousel */}
              {selectedApp.screenshots && selectedApp.screenshots.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Screenshots</h3>
                  <div className="flex space-x-4 overflow-x-auto pb-4 snap-x">
                    {selectedApp.screenshots.map((screenshot, index) => (
                      <div key={index} className="min-w-[300px] h-[200px] snap-center rounded-lg overflow-hidden">
                        <img 
                          src={screenshot} 
                          alt={`${selectedApp.name} screenshot ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Features with Icons */}
              {selectedApp.features && selectedApp.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedApp.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="text-blue-400 mt-1">
                          <Check size={16} />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Related Applications */}
              {selectedApp.relatedApps && selectedApp.relatedApps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Related Applications</h3>
                  <div className="flex space-x-4 overflow-x-auto pb-2">
                    {selectedApp.relatedApps.map(appId => {
                      const relatedApp = links.find(link => link.id === appId);
                      if (!relatedApp) return null;
                      
                      return (
                        <div 
                          key={appId}
                          className="min-w-[150px] p-3 glass-card rounded-lg flex flex-col items-center cursor-pointer hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                          onClick={() => {
                            setSelectedApp(relatedApp);
                          }}
                        >
                          <div className="p-2 rounded-lg bg-white bg-opacity-10 mb-2">
                            {getIcon(relatedApp.icon)}
                          </div>
                          <span className="text-sm font-medium">{relatedApp.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="p-6 border-t border-white border-opacity-10">
              <div className="flex flex-wrap gap-4">
                {selectedApp.githubUrl && (
                  <a
                    href={selectedApp.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 rounded-lg glass-card hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                  >
                    <Github size={20} className="mr-2" />
                    <span>GitHub Repository</span>
                  </a>
                )}
                
                {selectedApp.productHomepage && (
                  <a
                    href={selectedApp.productHomepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 rounded-lg glass-card hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                  >
                    <Home size={20} className="mr-2" />
                    <span>Product Homepage</span>
                  </a>
                )}
                
                {selectedApp.documentation && (
                  <a
                    href={selectedApp.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 rounded-lg glass-card hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                  >
                    <FileSearch size={20} className="mr-2" />
                    <span>Documentation</span>
                  </a>
                )}
                
                <a
                  href={selectedApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 ml-auto"
                >
                  <Server size={20} className="mr-2" />
                  <span>Launch Application</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App component that wraps everything with Router and AuthProvider
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            } 
          />
          <Route 
            path="/" 
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
