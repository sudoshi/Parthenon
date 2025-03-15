import React, { useState, useEffect } from 'react';
import { Settings, Grid, Shield, Database, BarChart as ChartBar, Server, Plus, X, Edit2, Save, Image, 
  Clock, Search, Activity, FileSearch, Wind, LayoutDashboard } from 'lucide-react';

interface AppLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
  logoUrl?: string;
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newLink, setNewLink] = useState<AppLink>({
    id: '',
    name: '',
    url: '',
    icon: 'grid',
    description: '',
    logoUrl: ''
  });

  const [links, setLinks] = useState<AppLink[]>([
    {
      id: '1',
      name: 'ATLAS',
      url: 'https://omop.acumenus.net/atlas',
      icon: 'grid',
      description: 'Clinical data analytics platform'
    },
    {
      id: '2',
      name: 'ARES',
      url: 'https://omop.acumenus.net/ares',
      icon: 'database',
      description: 'Data quality assessment tool'
    },
    {
      id: '3',
      name: 'HADES',
      url: 'https://omop.acumenus.net/hades',
      icon: 'chart-bar',
      description: 'Health Analytics Data-to-Evidence Suite'
    },
    {
      id: '4',
      name: 'Authentik',
      url: 'https://omop.acumenus.net/authentik',
      icon: 'shield',
      description: 'Identity provider'
    },
    {
      id: '5',
      name: 'Portainer',
      url: 'https://omop.acumenus.net/portainer',
      icon: 'server',
      description: 'Container management'
    },
    {
      id: '6',
      name: 'Datahub',
      url: 'https://omop.acumenus.net/datahub',
      icon: 'database',
      description: 'Data catalog and metadata platform'
    },
    {
      id: '7',
      name: 'Superset',
      url: 'https://omop.acumenus.net/superset',
      icon: 'chart-bar',
      description: 'Modern data exploration and visualization'
    },
    {
      id: '8',
      name: 'Solr',
      url: 'https://omop.acumenus.net/solr',
      icon: 'search',
      description: 'Search platform for healthcare data'
    },
    {
      id: '9',
      name: 'Orthanc',
      url: 'https://omop.acumenus.net/orthanc',
      icon: 'activity',
      description: 'DICOM server for medical imaging'
    },
    {
      id: '10',
      name: 'Perseus',
      url: 'https://omop.acumenus.net/perseus',
      icon: 'file-search',
      description: 'ETL validation and verification'
    },
    {
      id: '11',
      name: 'Airflow',
      url: 'https://omop.acumenus.net/airflow',
      icon: 'wind',
      description: 'Workflow automation platform'
    },
    {
      id: '12',
      name: 'Shiny Server',
      url: 'https://omop.acumenus.net/shiny',
      icon: 'layout-dashboard',
      description: 'Interactive R statistical applications'
    }
  ]);

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
      'layout-dashboard': <LayoutDashboard />
    };
    return icons[iconName as keyof typeof icons] || <Grid />;
  };

  const handleAddLink = () => {
    if (newLink.name && newLink.url) {
      setLinks([...links, { ...newLink, id: Date.now().toString() }]);
      setNewLink({ id: '', name: '', url: '', icon: 'grid', description: '', logoUrl: '' });
      setIsEditing(false);
    }
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 bg-mesh text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="h-16">
            <img src="/assets/Acumenus-Logo-Rounded.png" alt="Acumenus Logo" className="h-full object-contain" />
          </div>
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className="px-4 py-2 rounded-lg glass-card hover:bg-opacity-20 hover:bg-white transition-all duration-300"
          >
            {isAdmin ? 'Exit Admin' : 'Admin Mode'}
          </button>
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
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
              >
                Launch
              </a>
            </div>
          ))}

          {isAdmin && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="glass-card flex items-center justify-center h-full min-h-[200px] rounded-xl hover:bg-opacity-20 hover:bg-white transition-all duration-300 transform hover:-translate-y-2 hover:translate-x-1"
            >
              <div className="flex flex-col items-center text-gray-300">
                <Plus size={40} />
                <span className="mt-2">Add New Application</span>
              </div>
            </button>
          )}
        </div>

        {isAdmin && isEditing && (
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
                  placeholder="Logo URL (optional)"
                  value={newLink.logoUrl}
                  onChange={(e) => setNewLink({ ...newLink, logoUrl: e.target.value })}
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
    </div>
  );
}

export default App;
