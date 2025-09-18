import { AnalyticsWidgets } from "./AnalyticsWidgets";
import { CityMapView } from "./CityMapView";
import { IssueTable, Issue } from "./IssueTable";
import { useEffect, useState } from "react";
import ApiService from "../services/api";

interface DashboardPageProps {
  onIssueClick: (issue: Issue) => void;
  onToggleFilters: () => void;
  onMarkerClick: (markerId: string) => void;
}

export function DashboardPage({ onIssueClick, onToggleFilters, onMarkerClick }: DashboardPageProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getReports({ limit: 10 });
        
        if (response.success) {
          // Transform API data to match Issue interface
          const transformedIssues: Issue[] = response.data.reports.map((report: any) => ({
            id: report.report_id,
            category: report.category,
            location: report.location_text || 'Location not specified',
            status: report.status === 'submitted' ? 'open' : 
                   report.status === 'in_progress' ? 'in-progress' : 
                   report.status === 'resolved' ? 'resolved' : report.status,
            priority: report.priority,
            dateReported: new Date(report.created_at).toISOString().split('T')[0],
            assignedDept: report.department,
            description: report.description,
            reporter: report.users?.full_name || 'Unknown'
          }));
          setIssues(transformedIssues);
        } else {
          setError(response.error || 'Failed to fetch issues');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Issues fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Loading real-time data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Error loading dashboard data
          </p>
        </div>
        <div className="p-6 border rounded-lg text-center text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1>Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Real-time overview of civic issues and system performance
        </p>
      </div>

      {/* Analytics Widgets */}
      <AnalyticsWidgets />
      
      {/* Map and Table Container */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* City Map */}
        <CityMapView onMarkerClick={onMarkerClick} issues={issues} />
        
        {/* Recent Issues */}
        <div className="space-y-4">
          <IssueTable 
            onIssueClick={onIssueClick}
            onToggleFilters={onToggleFilters}
            issues={issues}
          />
        </div>
      </div>
    </div>
  );
}