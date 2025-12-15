const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // For cookies
  };

  // Add auth token if available
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }

  return data;
};

// Auth API
export const authAPI = {
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  getMe: () => apiCall('/auth/me'),
  verify: () => apiCall('/auth/verify'),
};

// Admin API
export const adminAPI = {
  // Profile
  getProfile: () => apiCall('/admin/profile'),
  updateProfile: (data) => apiCall('/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Skills
  getSkills: () => apiCall('/admin/skills'),
  addSkill: (data) => apiCall('/admin/skills', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSkill: (id, data) => apiCall(`/admin/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSkill: (id) => apiCall(`/admin/skills/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: () => apiCall('/admin/projects'),
  addProject: (data) => apiCall('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProject: (id, data) => apiCall(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProject: (id) => apiCall(`/admin/projects/${id}`, { method: 'DELETE' }),

  // Certificates
  getCertificates: () => apiCall('/admin/certificates'),
  addCertificate: (data) => apiCall('/admin/certificates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCertificate: (id, data) => apiCall(`/admin/certificates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCertificate: (id) => apiCall(`/admin/certificates/${id}`, { method: 'DELETE' }),

  // Messages
  getMessages: () => apiCall('/admin/messages'),
  markMessageRead: (id) => apiCall(`/admin/messages/${id}/read`, { method: 'PUT' }),
  deleteMessage: (id) => apiCall(`/admin/messages/${id}`, { method: 'DELETE' }),

  // Stats
  getStats: () => apiCall('/admin/stats'),

  // Experience
  getExperience: () => apiCall('/admin/experience'),
  addExperience: (data) => apiCall('/admin/experience', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteExperience: (id) => apiCall(`/admin/experience/${id}`, { method: 'DELETE' }),

  // Education
  getEducation: () => apiCall('/admin/education'),
  addEducation: (data) => apiCall('/admin/education', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateEducation: (id, data) => apiCall(`/admin/education/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteEducation: (id) => apiCall(`/admin/education/${id}`, { method: 'DELETE' }),
};

// Public API
export const publicAPI = {
  getProfile: () => apiCall('/public/profile'),
  getSkills: () => apiCall('/public/skills'),
  getProjects: () => apiCall('/public/projects'),
  getProject: (id) => apiCall(`/public/projects/${id}`),
  getCertificates: () => apiCall('/public/certificates'),
  getExperience: () => apiCall('/public/experience'),
  getEducation: () => apiCall('/public/education'),
  getVisitorCount: (page) => apiCall(`/public/visitor-count${page ? `?page=${encodeURIComponent(page)}` : ''}`),
  submitContact: (data) => apiCall('/public/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  trackVisit: (page) => apiCall('/public/track-visit', {
    method: 'POST',
    body: JSON.stringify({ page }),
  }),
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file, folder = 'images') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  uploadProfilePic: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/upload/profile-pic`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  uploadProjectImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/upload/project-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  uploadCertificate: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/upload/certificate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/upload/resume`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  uploadBlogImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/upload/blog-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  uploadBlogAttachment: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/upload/blog-attachment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
};

// ==================== BLOG API ====================
export const blogAPI = {
  // Public methods
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/blogs${query ? `?${query}` : ''}`);
  },
  
  getFeatured: () => apiCall('/blogs/featured'),
  
  getBySlug: (slug) => apiCall(`/blogs/${slug}`),
  
  getCategories: () => apiCall('/blogs/categories'),
  
  getTags: () => apiCall('/blogs/tags'),

  // Admin methods
  adminGetAll: () => apiCall('/admin/blogs'),
  
  adminGetById: (id) => apiCall(`/admin/blogs/${id}`),
  
  create: (data) => apiCall('/admin/blogs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => apiCall(`/admin/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiCall(`/admin/blogs/${id}`, {
    method: 'DELETE',
  }),
  
  togglePublish: (id, is_published) => apiCall(`/admin/blogs/${id}/publish`, {
    method: 'PUT',
    body: JSON.stringify({ is_published }),
  }),
};

export default { authAPI, adminAPI, publicAPI, uploadAPI, blogAPI };
