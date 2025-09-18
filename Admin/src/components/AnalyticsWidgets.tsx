import { Card } from "./ui/card";
import { AlertCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import ApiService from "../services/api";

interface AnalyticsWidgetsProps {
  className?: string;
}

interface AnalyticsData {
  total_reports: number;
  reports_by_status: {
    submitted?: number;
    in_progress?: number;
    resolved?: number;
    closed?: number;
  };
  reports_by_priority: {
    low?: number;
    medium?: number;
    high?: number;
    urgent?: number;
  };
  user_statistics?: {
    total_users: number;
    active_users: number;
  };
}

export function AnalyticsWidgets({ className }: AnalyticsWidgetsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getOverviewStats();
        
        if (response.success) {
          setAnalyticsData(response.data.overview);
        } else {
          setError(response.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        <Card className="p-6 col-span-full">
          <div className="text-center text-red-600">
            Error loading analytics: {error}
          </div>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const openIssues = (analyticsData.reports_by_status.submitted || 0) + 
                    (analyticsData.reports_by_status.in_progress || 0);
  const inProgress = analyticsData.reports_by_status.in_progress || 0;
  const resolvedToday = analyticsData.reports_by_status.resolved || 0;
  const avgResolutionTime = "2.3 days"; // This would need to be calculated from performance metrics

  const widgets = [
    {
      title: "Open Issues",
      value: openIssues.toString(),
      change: "+12", // This would need to be calculated from trend data
      changeType: "increase" as const,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "In Progress",
      value: inProgress.toString(),
      change: "+5", // This would need to be calculated from trend data
      changeType: "increase" as const,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Resolved Today",
      value: resolvedToday.toString(),
      change: "+8", // This would need to be calculated from trend data
      changeType: "increase" as const,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Avg Resolution Time",
      value: avgResolutionTime,
      change: "-0.5", // This would need to be calculated from trend data
      changeType: "decrease" as const,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {widgets.map((widget) => (
        <Card key={widget.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{widget.title}</p>
              <p className="text-2xl mb-1">{widget.value}</p>
              <div className="flex items-center gap-1">
                <span
                  className={`text-sm ${
                    widget.changeType === "increase" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {widget.change}
                </span>
                <span className="text-sm text-muted-foreground">vs yesterday</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${widget.bgColor}`}>
              <widget.icon className={`w-6 h-6 ${widget.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}