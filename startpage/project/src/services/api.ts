// Helper function for API error handling
const handleApiError = async (response: Response, defaultMessage: string): Promise<never> => {
  console.error(`API Error: ${response.status} ${response.statusText}`);
  let errorMessage = defaultMessage;
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || defaultMessage;
    console.error('Error details:', errorData);
  } catch (parseError) {
    console.error('Could not parse error response:', parseError);
  }
  
  throw new Error(errorMessage);
};

// API service for users
export const usersApi = {
  // Get all users
  getUsers: async () => {
    try {
      console.log('Fetching users...');
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        return handleApiError(response, 'Failed to fetch users');
      }
      
      const data = await response.json();
      console.log('Users fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },
  
  // Get a single user by ID
  getUser: async (id: number) => {
    try {
      console.log(`Fetching user ${id}...`);
      const response = await fetch(`/api/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        return handleApiError(response, `Failed to fetch user ${id}`);
      }
      
      const data = await response.json();
      console.log(`User ${id} fetched successfully:`, data);
      return data;
    } catch (error) {
      console.error(`Error in getUser(${id}):`, error);
      throw error;
    }
  },
  
  // Create a new user
  createUser: async (userData: { username: string; email: string; password: string; isAdmin: boolean }) => {
    try {
      console.log('Creating user with data:', { ...userData, password: '***REDACTED***' });
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        return handleApiError(response, 'Failed to create user');
      }
      
      const data = await response.json();
      console.log('User created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },
  
  // Update an existing user
  updateUser: async (id: number, userData: { username?: string; email?: string; password?: string; isAdmin?: boolean }) => {
    try {
      console.log(`Updating user ${id} with data:`, { ...userData, password: userData.password ? '***REDACTED***' : undefined });
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        return handleApiError(response, `Failed to update user ${id}`);
      }
      
      const data = await response.json();
      console.log(`User ${id} updated successfully:`, data);
      return data;
    } catch (error) {
      console.error(`Error in updateUser(${id}):`, error);
      throw error;
    }
  },
  
  // Delete a user
  deleteUser: async (id: number) => {
    try {
      console.log(`Deleting user ${id}...`);
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        return handleApiError(response, `Failed to delete user ${id}`);
      }
      
      const data = await response.json();
      console.log(`User ${id} deleted successfully:`, data);
      return data;
    } catch (error) {
      console.error(`Error in deleteUser(${id}):`, error);
      throw error;
    }
  },
};

// Interface for application links
export interface AppLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
  detailedDescription?: string;
  githubUrl?: string;
  productHomepage?: string;
  documentation?: string;
  logoUrl?: string;
  bannerImage?: string;
  features?: string[];
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

// API service for application links
export const appLinksApi = {
  // Get all application links
  getLinks: async () => {
    try {
      console.log('Fetching application links...');
      const response = await fetch('/api/links', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Added credentials to ensure auth cookies are sent
      });
      
      if (!response.ok) {
        return handleApiError(response, 'Failed to fetch application links');
      }
      
      const data = await response.json();
      console.log('Application links fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in getLinks:', error);
      throw error;
    }
  },
  
  // Get a single application link by ID
  getLink: async (id: string) => {
    try {
      console.log(`Fetching application link ${id}...`);
      const response = await fetch(`/api/links/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Added credentials to ensure auth cookies are sent
      });
      
      if (!response.ok) {
        return handleApiError(response, `Failed to fetch application link ${id}`);
      }
      
      const data = await response.json();
      console.log(`Application link ${id} fetched successfully:`, data);
      return data;
    } catch (error) {
      console.error(`Error in getLink(${id}):`, error);
      throw error;
    }
  },
  
  // Create a new application link
  createLink: async (linkData: Omit<AppLink, 'id'>) => {
    try {
      console.log('Creating application link with data:', linkData);
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        return handleApiError(response, 'Failed to create application link');
      }
      
      const data = await response.json();
      console.log('Application link created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createLink:', error);
      throw error;
    }
  },
  
  // Update an existing application link
  updateLink: async (id: string, linkData: Omit<AppLink, 'id'>) => {
    try {
      console.log(`Updating application link ${id} with data:`, linkData);
      const response = await fetch(`/api/links/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        return handleApiError(response, `Failed to update application link ${id}`);
      }
      
      const data = await response.json();
      console.log(`Application link ${id} updated successfully:`, data);
      return data;
    } catch (error) {
      console.error(`Error in updateLink(${id}):`, error);
      throw error;
    }
  },
  
  // Delete an application link
  deleteLink: async (id: string) => {
    try {
      console.log(`Deleting application link ${id}...`);
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        return handleApiError(response, `Failed to delete application link ${id}`);
      }
      
      const data = await response.json();
      console.log(`Application link ${id} deleted successfully:`, data);
      return data;
    } catch (error) {
      console.error(`Error in deleteLink(${id}):`, error);
      throw error;
    }
  },
};
