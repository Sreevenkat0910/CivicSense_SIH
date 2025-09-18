// API Service for Admin Frontend
// This service handles all API calls to the backend

const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
  private static token: string | null = null;

  // Set authentication token
  static setToken(token: string) {
    this.token = token;
  }

  // Get headers with authentication
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API call method
  private static async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log("Making API call to:", url);
      console.log("Request options:", { ...options, body: options.body ? "***" : undefined });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        console.error("API call failed:", { status: response.status, data });
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API call error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  static async login(email: string, password: string) {
    console.log("ApiService.login called with:", { email, password: "***" });
    const result = await this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log("ApiService.login result:", result);
    return result;
  }

  static async register(userData: {
    fullName: string;
    email: string;
    password: string;
    mobile?: string;
    language?: string;
    usertype_id?: number;
    department?: string;
    mandal_area?: string;
  }) {
    return this.apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async verifyToken() {
    return this.apiCall('/auth/verify');
  }

  static async logout() {
    return this.apiCall('/auth/logout', {
      method: 'POST',
    });
  }

  // Reports endpoints
  static async getReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    category?: string;
    priority?: string;
    mandal_area?: string;
    sort_by?: string;
    sort_order?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reports?${queryString}` : '/reports';
    
    return this.apiCall(endpoint);
  }

  static async getReport(reportId: string) {
    return this.apiCall(`/reports/${reportId}`);
  }

  static async createReport(reportData: {
    title: string;
    category: string;
    description: string;
    locationText?: string;
    latitude?: number;
    longitude?: number;
    photos?: Array<{ url: string; caption?: string }>;
    voiceNoteUrl?: string;
    department: string;
    reporterEmail?: string;
    reporterUserId?: string;
    priority?: string;
  }) {
    return this.apiCall('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  static async updateReportStatus(
    reportId: string,
    statusData: {
      status: string;
      assigned_to?: string;
      resolution_notes?: string;
    }
  ) {
    return this.apiCall(`/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  static async getUserReports(userId: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reports/user/${userId}?${queryString}` : `/reports/user/${userId}`;
    
    return this.apiCall(endpoint);
  }

  static async getNearbyReports(lat: number, lng: number, radius?: number) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    
    if (radius) {
      params.append('radius', radius.toString());
    }
    
    return this.apiCall(`/reports/nearby?${params.toString()}`);
  }

  static async uploadPhotos(files: FileList) {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('photos', file);
    });

    return fetch(`${API_BASE_URL}/reports/upload-photos`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || `HTTP ${response.status}`,
      };
    });
  }

  // Users endpoints
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    department?: string;
    mandal_area?: string;
    usertype_id?: number;
    is_active?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return this.apiCall(endpoint);
  }

  static async getUser(userId: string) {
    return this.apiCall(`/users/${userId}`);
  }

  static async updateUser(userId: string, userData: {
    full_name?: string;
    mobile?: string;
    language?: string;
    department?: string;
    mandal_area?: string;
  }) {
    return this.apiCall(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  static async changePassword(userId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.apiCall(`/users/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  }

  static async updateUserStatus(userId: string, isActive: boolean) {
    return this.apiCall(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  static async getUserStats() {
    return this.apiCall('/users/stats/overview');
  }

  // User Types endpoints
  static async getUserTypes() {
    return this.apiCall('/usertypes');
  }

  // Notifications endpoints
  static async getNotifications(params?: {
    page?: number;
    limit?: number;
    is_read?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    
    return this.apiCall(endpoint);
  }

  static async markNotificationAsRead(notificationId: string) {
    return this.apiCall(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  static async markAllNotificationsAsRead() {
    return this.apiCall('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  static async deleteNotification(notificationId: string) {
    return this.apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  static async createNotification(notificationData: {
    target_user_id: string;
    title: string;
    message: string;
    type?: string;
    related_report_id?: string;
  }) {
    return this.apiCall('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  static async getNotificationStats() {
    return this.apiCall('/notifications/stats');
  }

  // Schedules endpoints
  static async getSchedules(params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    is_recurring?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/schedules?${queryString}` : '/schedules';
    
    return this.apiCall(endpoint);
  }

  static async getSchedule(scheduleId: string) {
    return this.apiCall(`/schedules/${scheduleId}`);
  }

  static async createSchedule(scheduleData: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
  }) {
    return this.apiCall('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  static async updateSchedule(scheduleId: string, scheduleData: {
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
  }) {
    return this.apiCall(`/schedules/${scheduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(scheduleData),
    });
  }

  static async deleteSchedule(scheduleId: string) {
    return this.apiCall(`/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  }

  static async getCalendarSchedules(startDate: string, endDate: string) {
    return this.apiCall(`/schedules/calendar/${startDate}/${endDate}`);
  }

  static async getUpcomingSchedules(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.apiCall(`/schedules/upcoming${params}`);
  }

  // Analytics endpoints
  static async getOverviewStats(period?: number) {
    const params = period ? `?period=${period}` : '';
    return this.apiCall(`/analytics/overview${params}`);
  }

  static async getDepartmentStats(period?: number) {
    const params = period ? `?period=${period}` : '';
    return this.apiCall(`/analytics/departments${params}`);
  }

  static async getMandalAreaStats(period?: number) {
    const params = period ? `?period=${period}` : '';
    return this.apiCall(`/analytics/mandal-areas${params}`);
  }

  static async getTrendData(period?: number, groupBy?: string) {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period.toString());
    if (groupBy) queryParams.append('group_by', groupBy);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/trends?${queryString}` : '/analytics/trends';
    
    return this.apiCall(endpoint);
  }

  static async getPerformanceMetrics(period?: number) {
    const params = period ? `?period=${period}` : '';
    return this.apiCall(`/analytics/performance${params}`);
  }

  // Comprehensive dashboard data
  static async getDashboardData(period?: number) {
    const params = period ? `?period=${period}` : '';
    return this.apiCall(`/analytics/dashboard${params}`);
  }
}

export default ApiService;
