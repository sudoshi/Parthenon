import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, X, Edit2, Save, ArrowLeft, Trash2, Search, 
  AlertCircle, CheckCircle, User, Mail, Shield, Key,
  Database, Grid, Activity, FileSearch, Wind, LayoutDashboard,
  Server, BarChart
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { usersApi, appLinksApi, AppLink } from './services/api';

// User interface for this component
interface UserData {
  id: number;
  username: string;
  email: string;
  password?: string;
  isAdmin: boolean;
}

const AdminPage: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'users' | 'applications'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [applications, setApplications] = useState<AppLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // User form state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState<Omit<UserData, 'id'>>({
    username: '',
    email: '',
    password: '',
    isAdmin: false
  });
  
  // Application form state
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [newApp, setNewApp] = useState<Omit<AppLink, 'id'>>({
    name: '',
    url: '',
    icon: 'grid',
    description: '',
    detailedDescription: '',
    logoUrl: '',
    githubUrl: '',
    productHomepage: '',
    documentation: '',
    version: '',
    lastUpdated: ''
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (activeTab === 'users') {
        console.log('Fetching users data...');
        const userData = await usersApi.getUsers();
        console.log('Users data received:', userData);
        setUsers(userData);
      } else {
        console.log('Fetching application links data...');
        const appData = await appLinksApi.getLinks();
        console.log('Application links data received:', appData);
        setApplications(appData);
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load ${activeTab}: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter data based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredApps = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // User CRUD operations
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Adding new user:', { ...newUser, password: '***REDACTED***' });
      
      // Ensure password is not undefined for new users
      const userData = {
        ...newUser,
        password: newUser.password || '' // This should never be empty due to the check above
      };
      
      const result = await usersApi.createUser(userData);
      console.log('User created successfully:', result);
      
      setSuccess('User created successfully');
      setIsAddingUser(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        isAdmin: false
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to create user: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateUser = async (id: number) => {
    if (!newUser.username || !newUser.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const userData = { ...newUser };
      if (!userData.password) {
        delete userData.password; // Don't update password if not provided
      }
      
      await usersApi.updateUser(id, userData);
      setSuccess('User updated successfully');
      setEditingUserId(null);
      setNewUser({
        username: '',
        email: '',
        password: '',
        isAdmin: false
      });
      fetchData();
    } catch (err) {
      console.error(`Failed to update user ${id}:`, err);
      setError('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await usersApi.deleteUser(id);
      setSuccess('User deleted successfully');
      fetchData();
    } catch (err) {
      console.error(`Failed to delete user ${id}:`, err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startEditUser = (user: UserData) => {
    setEditingUserId(user.id);
    setNewUser({
      username: user.username,
      email: user.email,
      password: '', // Don't include password in edit form
      isAdmin: user.isAdmin
    });
  };
  
  // Application CRUD operations
  const handleAddApp = async () => {
    if (!newApp.name || !newApp.url || !newApp.icon || !newApp.description) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Adding new application:', newApp);
      
      const result = await appLinksApi.createLink(newApp);
      console.log('Application created successfully:', result);
      
      setSuccess('Application created successfully');
      setIsAddingApp(false);
      setNewApp({
        name: '',
        url: '',
        icon: 'grid',
        description: '',
        detailedDescription: '',
        logoUrl: '',
        githubUrl: '',
        productHomepage: '',
        documentation: '',
        version: '',
        lastUpdated: ''
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create application:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to create application: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateApp = async (id: string) => {
    if (!newApp.name || !newApp.url || !newApp.icon || !newApp.description) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await appLinksApi.updateLink(id, newApp);
      setSuccess('Application updated successfully');
      setEditingAppId(null);
      setNewApp({
        name: '',
        url: '',
        icon: 'grid',
        description: '',
        detailedDescription: '',
        logoUrl: '',
        githubUrl: '',
        productHomepage: '',
        documentation: '',
        version: '',
        lastUpdated: ''
      });
      fetchData();
    } catch (err) {
      console.error(`Failed to update application ${id}:`, err);
      setError('Failed to update application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteApp = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await appLinksApi.deleteLink(id);
      setSuccess('Application deleted successfully');
      fetchData();
    } catch (err) {
      console.error(`Failed to delete application ${id}:`, err);
      setError('Failed to delete application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startEditApp = (app: AppLink) => {
    setEditingAppId(app.id);
    setNewApp({
      name: app.name,
      url: app.url,
      icon: app.icon,
      description: app.description,
      detailedDescription: app.detailedDescription || '',
      logoUrl: app.logoUrl || '',
      githubUrl: app.githubUrl || '',
      productHomepage: app.productHomepage || '',
      documentation: app.documentation || '',
      version: app.version || '',
      lastUpdated: app.lastUpdated || ''
    });
  };
  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  
  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 bg-mesh flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-xl max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 bg-mesh text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg glass-card hover:bg-white hover:bg-opacity-10 transition-all duration-300"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg glass-card hover:bg-white hover:bg-opacity-10 transition-all duration-300"
          >
            Logout
          </button>
        </div>
        
        {/* Notification Messages */}
        {error && (
          <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg flex items-center text-red-200">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg flex items-center text-green-200">
            <CheckCircle size={18} className="mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'users'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} className="inline mr-2" />
            Users
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'applications'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('applications')}
          >
            <Plus size={18} className="inline mr-2" />
            Applications
          </button>
        </div>
        
        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-white bg-opacity-10 border border-gray-600 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={() => {
              if (activeTab === 'users') {
                setIsAddingUser(true);
              } else {
                setIsAddingApp(true);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-medium transition-all duration-300 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add {activeTab === 'users' ? 'User' : 'Application'}
          </button>
        </div>
        
        {/* Content */}
        <div className="glass-card rounded-xl p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'users' ? (
            /* Users Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white hover:bg-opacity-5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <User size={20} className="text-gray-300" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isAdmin
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => startEditUser(user)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Applications Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-white hover:bg-opacity-5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              {/* Dynamically render the icon based on the app.icon value */}
                              {(() => {
                                switch (app.icon) {
                                  case 'grid': return <Grid size={20} className="text-gray-300" />;
                                  case 'database': return <Database size={20} className="text-gray-300" />;
                                  case 'chart-bar': return <BarChart size={20} className="text-gray-300" />;
                                  case 'shield': return <Shield size={20} className="text-gray-300" />;
                                  case 'server': return <Server size={20} className="text-gray-300" />;
                                  case 'search': return <Search size={20} className="text-gray-300" />;
                                  case 'activity': return <Activity size={20} className="text-gray-300" />;
                                  case 'file-search': return <FileSearch size={20} className="text-gray-300" />;
                                  case 'wind': return <Wind size={20} className="text-gray-300" />;
                                  case 'layout-dashboard': return <LayoutDashboard size={20} className="text-gray-300" />;
                                  default: return <Grid size={20} className="text-gray-300" />;
                                }
                              })()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {app.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{app.url}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 truncate max-w-xs">
                            {app.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => startEditApp(app)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit User Modal */}
      {(isAddingUser || editingUserId !== null) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-modal rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingUserId !== null ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setIsAddingUser(false);
                  setEditingUserId(null);
                  setNewUser({
                    username: '',
                    email: '',
                    password: '',
                    isAdmin: false
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Username <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 bg-white bg-opacity-10 border border-gray-600 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 bg-white bg-opacity-10 border border-gray-600 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password {editingUserId === null && <span className="text-red-400">*</span>}
                  {editingUserId !== null && <span className="text-gray-400 text-xs">(Leave blank to keep current password)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 bg-white bg-opacity-10 border border-gray-600 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder={editingUserId !== null ? "Enter new password (optional)" : "Enter password"}
                    required={editingUserId === null}
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-300">
                  Admin privileges
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddingUser(false);
                    setEditingUserId(null);
                    setNewUser({
                      username: '',
                      email: '',
                      password: '',
                      isAdmin: false
                    });
                  }}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingUserId !== null) {
                      handleUpdateUser(editingUserId);
                    } else {
                      handleAddUser();
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-medium transition-all duration-300 flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  {editingUserId !== null ? 'Update User' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Application Modal */}
      {(isAddingApp || editingAppId !== null) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-modal rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingAppId !== null ? 'Edit Application' : 'Add New Application'}
              </h2>
              <button
                onClick={() => {
                  setIsAddingApp(false);
                  setEditingAppId(null);
                  setNewApp({
                    name: '',
                    url: '',
                    icon: 'grid',
                    description: '',
                    detailedDescription: '',
                    logoUrl: '',
                    githubUrl: '',
                    productHomepage: '',
                    documentation: '',
                    version: '',
                    lastUpdated: ''
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Application form fields would go here */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newApp.name}
                    onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                    className="block w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-600 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Application name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
                    URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={newApp.url}
                    onChange={(e) => setNewApp({ ...newApp, url: e.target.value })}
                    className="block w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-600 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Application URL"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  value={newApp.description}
                  onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                  className="block w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-600 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Brief description"
                  rows={2}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-1">
                  Icon <span className="text-red-400">*</span>
                </label>
                <select
                  id="icon"
                  value={newApp.icon}
                  onChange={(e) => setNewApp({ ...newApp, icon: e.target.value })}
                  className="block w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-600 border-opacity-30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  required
                >
                  <option value="grid">Grid</option>
                  <option value="database">Database</option>
                  <option value="chart-bar">Chart</option>
                  <option value="shield">Shield</option>
                  <option value="server">Server</option>
                  <option value="search">Search</option>
                  <option value="activity">Activity</option>
                  <option value="file-search">File Search</option>
                  <option value="wind">Wind</option>
                  <option value="layout-dashboard">Dashboard</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddingApp(false);
                    setEditingAppId(null);
                    setNewApp({
                      name: '',
                      url: '',
                      icon: 'grid',
                      description: '',
                      detailedDescription: '',
                      logoUrl: '',
                      githubUrl: '',
                      productHomepage: '',
                      documentation: '',
                      version: '',
                      lastUpdated: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingAppId !== null) {
                      handleUpdateApp(editingAppId);
                    } else {
                      handleAddApp();
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-medium transition-all duration-300 flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  {editingAppId !== null ? 'Update Application' : 'Add Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
