import { AnalyticsWidgets } from "./AnalyticsWidgets";
import { CityMapView } from "./CityMapView";
import { IssueTable, Issue } from "./IssueTable";

interface DashboardPageProps {
  onIssueClick: (issue: Issue) => void;
  onToggleFilters: () => void;
  onMarkerClick: (markerId: string) => void;
}

export function DashboardPage({ onIssueClick, onToggleFilters, onMarkerClick }: DashboardPageProps) {
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
        <CityMapView onMarkerClick={onMarkerClick} />
        
        {/* Recent Issues */}
        <div className="space-y-4">
          <IssueTable 
            onIssueClick={onIssueClick}
            onToggleFilters={onToggleFilters}
          />
        </div>
      </div>
    </div>
  );
}