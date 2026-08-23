import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If running under Nginx (port 3009) or HTTPS live public tunnel, route through relative /api/v1 gateway
    if (window.location.port === '3009' || window.location.protocol === 'https:' || !window.location.hostname.includes('localhost')) {
      return '/api/v1';
    }
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const apiFetch = async (endpoint, options = {}) => {
  const res = await apiClient({
    url: endpoint,
    method: options.method || 'GET',
    data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
    ...options
  });
  return res.data;
};

export const authApi = {
  login: async (username, password) => {
    const res = await apiClient.post('/auth/user/login', { username, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('access_token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },
  signup: async (signupData, emailInput, passwordInput) => {
    let payload = {};
    if (typeof signupData === 'object' && signupData !== null) {
      payload = signupData;
    } else {
      payload = {
        username: signupData || emailInput,
        email: emailInput || signupData,
        password: passwordInput,
        role: 'student'
      };
    }
    const res = await apiClient.post('/auth/signup', payload);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('access_token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },
  forgotPassword: async (identifier) => {
    const res = await apiClient.post('/auth/forgot-password', { email: identifier });
    return res.data;
  },
  resetPasswordConfirm: async (token, new_password, email) => {
    const res = await apiClient.post('/auth/reset-password/confirm', { token, new_password, email });
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  }
};

export const userAuth = authApi;

export const adminAuth = {
  login: async (username, password) => {
    const res = await apiClient.post('/auth/admin/login', { username, password });
    if (res.data.token) {
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('access_token', res.data.token);
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('admin_token');
  }
};

export const exerciseApi = {
  getCatalog: async () => {
    const res = await apiClient.get(`/exercises/catalog?_t=${Date.now()}`);
    return res.data;
  },
  getModules: async () => {
    const res = await apiClient.get(`/exercises/catalog?_t=${Date.now()}`);
    return res.data;
  },
  getModuleDetail: async (moduleId) => {
    const res = await apiClient.get(`/exercises/modules/${moduleId}`);
    return res.data;
  },
  startLab: async (exerciseId, userEmail = 'student@lab.dev') => {
    const res = await apiClient.post(`/labs/${exerciseId}/start`, { email: userEmail });
    return res.data;
  },
  getLabStatus: async (exerciseId) => {
    const res = await apiClient.get(`/labs/${exerciseId}/status`);
    return res.data;
  },
  pauseLab: async (exerciseId) => {
    const res = await apiClient.post(`/labs/${exerciseId}/pause`);
    return res.data;
  },
  resumeLab: async (exerciseId) => {
    const res = await apiClient.post(`/labs/${exerciseId}/resume`);
    return res.data;
  },
  stopLab: async (exerciseId) => {
    const res = await apiClient.post(`/labs/${exerciseId}/stop`);
    return res.data;
  },
  submitExercise: async (exerciseId, payload = {}) => {
    const res = await apiClient.post(`/labs/${exerciseId}/submit`, payload);
    return res.data;
  },
  getUserProgress: async () => {
    const res = await apiClient.get('/exercises/progress/me');
    return res.data;
  },
  getStudentProgress: async () => {
    const res = await apiClient.get('/exercises/dashboard/me');
    const d = res.data;
    return {
      completed_count: d.stats?.completed_count || 0,
      total_exercises: d.stats?.total_exercises || 12,
      completion_rate: d.stats?.completion_rate || 0,
      total_score: d.stats?.total_score || 0,
      items: d.progress_items || []
    };
  },
  recordProgress: async (exerciseId, status, score) => {
    const res = await apiClient.post('/exercises/progress/me', { exercise_id: exerciseId, status, score });
    return res.data;
  },
  getDashboardMe: async () => {
    const res = await apiClient.get('/exercises/dashboard/me');
    return res.data;
  }
};

export const labApi = exerciseApi;

export const oracleApi = {
  getKpis: async () => {
    const res = await apiClient.get('/oracle/kpis');
    return res.data;
  },
  evaluateSubmission: async (data) => {
    const res = await apiClient.post('/oracle/evaluate', data);
    return res.data;
  }
};

export const adminApi = {
  getOverviewStats: async () => {
    const res = await apiClient.get('/admin-console/overview-stats');
    return res.data;
  },
  getAllStudentProgress: async () => {
    const res = await apiClient.get('/admin-console/student-progress');
    return res.data;
  },
  getUserDetail: async (userId) => {
    const res = await apiClient.get(`/admin-console/users/${userId}`);
    return res.data;
  },
  resetUserProgress: async (userId) => {
    const res = await apiClient.post(`/admin-console/users/${userId}`, { action: 'RESET_PROGRESS' });
    return res.data;
  },
  completeUserProgress: async (userId) => {
    const res = await apiClient.post(`/admin-console/users/${userId}`, { action: 'COMPLETE_PROGRESS' });
    return res.data;
  },
  deleteUser: async (userId) => {
    const res = await apiClient.delete(`/admin-console/users/${userId}`);
    return res.data;
  },
  getUsers: async () => {
    const res = await apiClient.get('/admin-console/users');
    return res.data;
  },
  addUser: async (name, email, role) => {
    const res = await apiClient.post('/admin-console/staff', { username: name, email, role });
    return res.data;
  },
  updateUserRole: async (userId, role, reason = '') => {
    const res = await apiClient.post(`/admin-console/users/${userId}/role`, { role, reason });
    return res.data;
  },
  nullifyPassword: async (userId) => {
    const res = await apiClient.post(`/admin-console/users/${userId}/nullify-password`);
    return res.data;
  },
  getSecurityLogs: async () => {
    const res = await apiClient.get('/admin-console/security-logs');
    return res.data;
  }
};

export const aiApi = {
  getGreeting: async () => {
    const res = await apiClient.get('/ai/greeting');
    return res.data;
  },
  sendMessage: async (message) => {
    const res = await apiClient.post('/ai/chat', { message });
    return res.data;
  }
};
