import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Mock data for testing when database is not available
const mockReports = [
  {
    id: '1',
    report_id: 'PUBW-2024-000001',
    title: 'Broken Street Light',
    category: 'Infrastructure',
    department: 'Public Works',
    mandal_area: 'Central Zone',
    priority: 'medium',
    status: 'submitted',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    report_id: 'WATR-2024-000001',
    title: 'Water Leakage',
    category: 'Water',
    department: 'Water Department',
    mandal_area: 'North Zone',
    priority: 'high',
    status: 'in_progress',
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: '3',
    report_id: 'PUBW-2024-000002',
    title: 'Pothole on Highway',
    category: 'Roads',
    department: 'Public Works',
    mandal_area: 'South Zone',
    priority: 'high',
    status: 'resolved',
    created_at: '2024-01-13T08:00:00Z',
    updated_at: '2024-01-17T16:00:00Z'
  },
  {
    id: '4',
    report_id: 'SANI-2024-000001',
    title: 'Garbage Collection Issue',
    category: 'Sanitation',
    department: 'Sanitation Department',
    mandal_area: 'East Zone',
    priority: 'medium',
    status: 'submitted',
    created_at: '2024-01-12T11:00:00Z',
    updated_at: '2024-01-12T11:00:00Z'
  },
  {
    id: '5',
    report_id: 'TRFC-2024-000001',
    title: 'Traffic Signal Malfunction',
    category: 'Traffic',
    department: 'Traffic Department',
    mandal_area: 'West Zone',
    priority: 'urgent',
    status: 'in_progress',
    created_at: '2024-01-11T15:30:00Z',
    updated_at: '2024-01-13T09:15:00Z'
  }
];

const mockUsers = [
  {
    user_id: 'admin-001',
    usertype_id: 1,
    department: 'Administration',
    mandal_area: 'All Zones',
    is_active: true,
    user_types: { type_name: 'admin' }
  },
  {
    user_id: 'dept-001',
    usertype_id: 2,
    department: 'Public Works',
    mandal_area: 'North Zone',
    is_active: true,
    user_types: { type_name: 'department' }
  },
  {
    user_id: 'citizen-001',
    usertype_id: 4,
    department: null,
    mandal_area: 'Central Zone',
    is_active: true,
    user_types: { type_name: 'citizen' }
  }
];

// Check if database is available
const isDatabaseAvailable = () => {
  return false; // Force mock data usage for now
};

// Get dashboard overview statistics
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '30' } = req.query; // days

    if (isDatabaseAvailable()) {
      // Use Supabase database
      // Check user permissions
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('usertype_id, department, mandal_area, user_types(type_name)')
        .eq('user_id', userId)
        .single();

      if (userError || !currentUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const userType = currentUser.user_types?.type_name;
      const userDepartment = currentUser.department;
      const userMandalArea = currentUser.mandal_area;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Base query for reports
      let reportQuery = supabase.from('reports').select('*');
      
      // Apply filters based on user type
      if (userType === 'department') {
        reportQuery = reportQuery.eq('department', userDepartment);
      } else if (userType === 'mandal-admin') {
        reportQuery = reportQuery.eq('mandal_area', userMandalArea);
      }

      // Get total reports count
      const { count: totalReports } = await reportQuery
        .select('*', { count: 'exact', head: true });

      // Get reports by status
      const { data: statusData } = await reportQuery
        .select('status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const statusCounts = {};
      if (statusData) {
        statusData.forEach(report => {
          statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
        });
      }

      // Get reports by priority
      const { data: priorityData } = await reportQuery
        .select('priority')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const priorityCounts = {};
      if (priorityData) {
        priorityData.forEach(report => {
          priorityCounts[report.priority] = (priorityCounts[report.priority] || 0) + 1;
        });
      }

      // Get reports by category
      const { data: categoryData } = await reportQuery
        .select('category')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const categoryCounts = {};
      if (categoryData) {
        categoryData.forEach(report => {
          categoryCounts[report.category] = (categoryCounts[report.category] || 0) + 1;
        });
      }

      // Get daily report counts for chart
      const { data: dailyData } = await reportQuery
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      const dailyCounts = {};
      if (dailyData) {
        dailyData.forEach(report => {
          const date = new Date(report.created_at).toISOString().split('T')[0];
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });
      }

      // Get user statistics if admin
      let userStats = null;
      if (userType === 'admin') {
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        const { count: activeUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        userStats = {
          total_users: totalUsers || 0,
          active_users: activeUsers || 0
        };
      }

      return res.status(200).json({
        success: true,
        overview: {
          total_reports: totalReports || 0,
          reports_by_status: statusCounts,
          reports_by_priority: priorityCounts,
          reports_by_category: categoryCounts,
          daily_reports: dailyCounts,
          user_statistics: userStats,
          period_days: parseInt(period)
        }
      });
    } else {
      // Use mock data
      const currentUser = mockUsers.find(u => u.user_id === userId);
      if (!currentUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const userType = currentUser.user_types?.type_name;
      const userDepartment = currentUser.department;
      const userMandalArea = currentUser.mandal_area;

      // Filter reports based on user type
      let filteredReports = [...mockReports];
      if (userType === 'department') {
        filteredReports = filteredReports.filter(r => r.department === userDepartment);
      } else if (userType === 'mandal-admin') {
        filteredReports = filteredReports.filter(r => r.mandal_area === userMandalArea);
      }

      // Calculate statistics
      const statusCounts = {};
      const priorityCounts = {};
      const categoryCounts = {};
      const dailyCounts = {};

      filteredReports.forEach(report => {
        // Status counts
        statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
        
        // Priority counts
        priorityCounts[report.priority] = (priorityCounts[report.priority] || 0) + 1;
        
        // Category counts
        categoryCounts[report.category] = (categoryCounts[report.category] || 0) + 1;
        
        // Daily counts
        const date = new Date(report.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      // User statistics for admin
      let userStats = null;
      if (userType === 'admin') {
        userStats = {
          total_users: mockUsers.length,
          active_users: mockUsers.filter(u => u.is_active).length
        };
      }

      return res.status(200).json({
        success: true,
        overview: {
          total_reports: filteredReports.length,
          reports_by_status: statusCounts,
          reports_by_priority: priorityCounts,
          reports_by_category: categoryCounts,
          daily_reports: dailyCounts,
          user_statistics: userStats,
          period_days: parseInt(period)
        }
      });
    }
  } catch (err) {
    console.error('Get overview statistics error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get department-wise statistics
router.get('/departments', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '30' } = req.query;

    // Check if user has permission to view department stats
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, user_types(type_name)')
      .eq('user_id', userId)
      .single();

    if (userError || !currentUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userType = currentUser.user_types?.type_name;
    if (!['admin', 'mandal-admin'].includes(userType)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get department statistics
    const { data: departmentData, error } = await supabase
      .from('reports')
      .select('department, status, priority')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch department statistics' });
    }

    const departmentStats = {};
    if (departmentData) {
      departmentData.forEach(report => {
        const dept = report.department;
        if (!departmentStats[dept]) {
          departmentStats[dept] = {
            total: 0,
            by_status: {},
            by_priority: {}
          };
        }
        
        departmentStats[dept].total++;
        departmentStats[dept].by_status[report.status] = 
          (departmentStats[dept].by_status[report.status] || 0) + 1;
        departmentStats[dept].by_priority[report.priority] = 
          (departmentStats[dept].by_priority[report.priority] || 0) + 1;
      });
    }

    return res.status(200).json({
      success: true,
      department_statistics: departmentStats,
      period_days: parseInt(period)
    });
  } catch (err) {
    console.error('Get department statistics error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get mandal area statistics
router.get('/mandal-areas', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '30' } = req.query;

    // Check if user has permission
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, user_types(type_name)')
      .eq('user_id', userId)
      .single();

    if (userError || !currentUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userType = currentUser.user_types?.type_name;
    if (!['admin', 'mandal-admin'].includes(userType)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get mandal area statistics
    const { data: mandalData, error } = await supabase
      .from('reports')
      .select('mandal_area, status, priority, department')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch mandal area statistics' });
    }

    const mandalStats = {};
    if (mandalData) {
      mandalData.forEach(report => {
        const mandal = report.mandal_area;
        if (!mandalStats[mandal]) {
          mandalStats[mandal] = {
            total: 0,
            by_status: {},
            by_priority: {},
            by_department: {}
          };
        }
        
        mandalStats[mandal].total++;
        mandalStats[mandal].by_status[report.status] = 
          (mandalStats[mandal].by_status[report.status] || 0) + 1;
        mandalStats[mandal].by_priority[report.priority] = 
          (mandalStats[mandal].by_priority[report.priority] || 0) + 1;
        mandalStats[mandal].by_department[report.department] = 
          (mandalStats[mandal].by_department[report.department] || 0) + 1;
      });
    }

    return res.status(200).json({
      success: true,
      mandal_area_statistics: mandalStats,
      period_days: parseInt(period)
    });
  } catch (err) {
    console.error('Get mandal area statistics error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get trend data for charts
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '30', group_by = 'day' } = req.query;

    // Check user permissions
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, department, mandal_area, user_types(type_name)')
      .eq('user_id', userId)
      .single();

    if (userError || !currentUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userType = currentUser.user_types?.type_name;
    const userDepartment = currentUser.department;
    const userMandalArea = currentUser.mandal_area;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Base query
    let query = supabase.from('reports').select('created_at, status, priority, category');
    
    // Apply filters based on user type
    if (userType === 'department') {
      query = query.eq('department', userDepartment);
    } else if (userType === 'mandal-admin') {
      query = query.eq('mandal_area', userMandalArea);
    }

    const { data: trendData, error } = await query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch trend data' });
    }

    // Process trend data based on group_by parameter
    const trends = {
      by_date: {},
      by_status: {},
      by_priority: {},
      by_category: {}
    };

    if (trendData) {
      trendData.forEach(report => {
        const date = new Date(report.created_at);
        let dateKey;
        
        if (group_by === 'day') {
          dateKey = date.toISOString().split('T')[0];
        } else if (group_by === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toISOString().split('T')[0];
        } else if (group_by === 'month') {
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        // Count by date
        trends.by_date[dateKey] = (trends.by_date[dateKey] || 0) + 1;
        
        // Count by status
        trends.by_status[report.status] = (trends.by_status[report.status] || 0) + 1;
        
        // Count by priority
        trends.by_priority[report.priority] = (trends.by_priority[report.priority] || 0) + 1;
        
        // Count by category
        trends.by_category[report.category] = (trends.by_category[report.category] || 0) + 1;
      });
    }

    return res.status(200).json({
      success: true,
      trends: trends,
      period_days: parseInt(period),
      group_by: group_by
    });
  } catch (err) {
    console.error('Get trend data error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get performance metrics
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '30' } = req.query;

    // Check user permissions
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, department, mandal_area, user_types(type_name)')
      .eq('user_id', userId)
      .single();

    if (userError || !currentUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userType = currentUser.user_types?.type_name;
    const userDepartment = currentUser.department;
    const userMandalArea = currentUser.mandal_area;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Base query
    let query = supabase.from('reports').select('created_at, updated_at, status');
    
    // Apply filters
    if (userType === 'department') {
      query = query.eq('department', userDepartment);
    } else if (userType === 'mandal-admin') {
      query = query.eq('mandal_area', userMandalArea);
    }

    const { data: performanceData, error } = await query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch performance data' });
    }

    // Calculate performance metrics
    const metrics = {
      total_reports: performanceData?.length || 0,
      resolved_reports: 0,
      avg_resolution_time_hours: 0,
      resolution_rate: 0
    };

    if (performanceData) {
      const resolvedReports = performanceData.filter(report => 
        ['resolved', 'closed'].includes(report.status)
      );
      
      metrics.resolved_reports = resolvedReports.length;
      metrics.resolution_rate = metrics.total_reports > 0 ? 
        (metrics.resolved_reports / metrics.total_reports) * 100 : 0;

      // Calculate average resolution time
      if (resolvedReports.length > 0) {
        const totalResolutionTime = resolvedReports.reduce((total, report) => {
          const created = new Date(report.created_at);
          const updated = new Date(report.updated_at);
          return total + (updated - created);
        }, 0);
        
        metrics.avg_resolution_time_hours = totalResolutionTime / resolvedReports.length / (1000 * 60 * 60);
      }
    }

    return res.status(200).json({
      success: true,
      performance_metrics: metrics,
      period_days: parseInt(period)
    });
  } catch (err) {
    console.error('Get performance metrics error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get comprehensive dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '30' } = req.query;

    if (isDatabaseAvailable()) {
      // Use Supabase database
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('usertype_id, department, mandal_area, user_types(type_name)')
        .eq('user_id', userId)
        .single();

      if (userError || !currentUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const userType = currentUser.user_types?.type_name;
      const userDepartment = currentUser.department;
      const userMandalArea = currentUser.mandal_area;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Base query for reports
      let reportQuery = supabase.from('reports').select('*');
      
      // Apply filters based on user type
      if (userType === 'department') {
        reportQuery = reportQuery.eq('department', userDepartment);
      } else if (userType === 'mandal-admin') {
        reportQuery = reportQuery.eq('mandal_area', userMandalArea);
      }

      // Get comprehensive statistics
      const { data: reportsData } = await reportQuery
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Calculate issue summary
      const issueSummary = {
        requireAttention: 0,
        beingWorkedOn: 0,
        successfullyCompleted: 0
      };

      if (reportsData) {
        reportsData.forEach(report => {
          if (report.status === 'submitted' || report.priority === 'urgent' || report.priority === 'high') {
            issueSummary.requireAttention++;
          } else if (report.status === 'in_progress') {
            issueSummary.beingWorkedOn++;
          } else if (report.status === 'resolved') {
            issueSummary.successfullyCompleted++;
          }
        });
      }

      // Calculate department performance
      const departmentStats = {};
      if (reportsData) {
        reportsData.forEach(report => {
          const dept = report.department;
          if (!departmentStats[dept]) {
            departmentStats[dept] = {
              total: 0,
              resolved: 0,
              inProgress: 0,
              submitted: 0
            };
          }
          
          departmentStats[dept].total++;
          departmentStats[dept][report.status] = (departmentStats[dept][report.status] || 0) + 1;
        });
      }

      // Calculate efficiency for each department
      const departmentPerformance = Object.entries(departmentStats).map(([name, stats]) => {
        const efficiency = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
        return {
          name,
          staffMembers: Math.floor(Math.random() * 20) + 10, // Mock staff count
          openIssues: stats.submitted + stats.inProgress,
          efficiency: Math.max(60, Math.min(100, efficiency + Math.floor(Math.random() * 20)))
        };
      });

      // Get recent activity
      const recentActivity = reportsData ? reportsData.slice(0, 4).map((report, index) => ({
        id: `activity-${report.report_id}`,
        description: `New ${report.category.toLowerCase()} issue reported in ${report.department}`,
        timestamp: getTimeAgo(new Date(report.created_at)),
        type: 'issue'
      })) : [];

      // Add system activities
      const systemActivities = [
        {
          id: 'system-1',
          description: 'New user added to Public Works',
          timestamp: '2 hours ago',
          type: 'user'
        },
        {
          id: 'system-2',
          description: 'Traffic Department staff updated',
          timestamp: '4 hours ago',
          type: 'department'
        },
        {
          id: 'system-3',
          description: 'High issue volume in Water Department',
          timestamp: '6 hours ago',
          type: 'system'
        }
      ];

      const allActivities = [...systemActivities, ...recentActivity].slice(0, 4);

      // Get user info
      const userInfo = {
        name: 'John Doe', // This would come from user profile
        role: userType === 'admin' ? 'City Administrator' : 
              userType === 'mandal-admin' ? 'Mandal Administrator' :
              userType === 'department' ? 'Department Head' : 'User',
        department: userDepartment || 'Administration'
      };

      return res.status(200).json({
        success: true,
        dashboard: {
          issueSummary,
          departmentPerformance,
          recentActivity: allActivities,
          userInfo
        }
      });
    } else {
      // Use mock data
      const currentUser = mockUsers.find(u => u.user_id === userId);
      if (!currentUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const userType = currentUser.user_types?.type_name;

      // Mock comprehensive dashboard data
      const issueSummary = {
        requireAttention: 4,
        beingWorkedOn: 2,
        successfullyCompleted: 1
      };

      const departmentPerformance = [
        {
          name: 'Public Works',
          staffMembers: 24,
          openIssues: 89,
          efficiency: 92
        },
        {
          name: 'Utilities',
          staffMembers: 18,
          openIssues: 45,
          efficiency: 87
        },
        {
          name: 'Parks & Recreation',
          staffMembers: 12,
          openIssues: 23,
          efficiency: 94
        },
        {
          name: 'Traffic Department',
          staffMembers: 15,
          openIssues: 34,
          efficiency: 89
        },
        {
          name: 'Water Department',
          staffMembers: 21,
          openIssues: 67,
          efficiency: 85
        }
      ];

      const recentActivity = [
        {
          id: 'activity-1',
          description: 'New user added to Public Works',
          timestamp: '2 hours ago',
          type: 'user'
        },
        {
          id: 'activity-2',
          description: 'Traffic Department staff updated',
          timestamp: '4 hours ago',
          type: 'department'
        },
        {
          id: 'activity-3',
          description: 'High issue volume in Water Department',
          timestamp: '6 hours ago',
          type: 'system'
        },
        {
          id: 'activity-4',
          description: 'Admin role assigned to Rajesh Kumar',
          timestamp: '1 day ago',
          type: 'user'
        }
      ];

      const userInfo = {
        name: 'John Doe',
        role: userType === 'admin' ? 'City Administrator' : 
              userType === 'mandal-admin' ? 'Mandal Administrator' :
              userType === 'department' ? 'Department Head' : 'User',
        department: currentUser.department || 'Administration'
      };

      return res.status(200).json({
        success: true,
        dashboard: {
          issueSummary,
          departmentPerformance,
          recentActivity,
          userInfo
        }
      });
    }
  } catch (err) {
    console.error('Get dashboard data error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

export default router;
