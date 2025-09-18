import { AnalyticsWidgets } from "./AnalyticsWidgets";
import { CityMapView } from "./CityMapView";
import { IssueTable, Issue } from "./IssueTable";

// Import mock issues data (in a real app, this would come from an API)
const mockIssues: Issue[] = [
  {
    id: "ISS-2024-001",
    category: "Pothole",
    location: "Main St & 5th Ave",
    status: "open",
    priority: "high",
    dateReported: "2024-01-15",
    assignedDept: "Public Works",
    description: "Large pothole causing traffic hazard",
    reporter: "Jane Smith"
  },
  {
    id: "ISS-2024-002",
    category: "Street Light",
    location: "Oak Park Blvd",
    status: "in-progress",
    priority: "medium",
    dateReported: "2024-01-14",
    assignedDept: "Utilities",
    description: "Street light not working",
    reporter: "Mike Johnson"
  },
  {
    id: "ISS-2024-003",
    category: "Graffiti",
    location: "Downtown Library",
    status: "resolved",
    priority: "low",
    dateReported: "2024-01-13",
    assignedDept: "Parks & Rec",
    description: "Graffiti on building wall",
    reporter: "Sarah Davis"
  },
  {
    id: "ISS-2024-004",
    category: "Traffic Signal",
    location: "1st St & Broadway",
    status: "open",
    priority: "high",
    dateReported: "2024-01-12",
    assignedDept: "Traffic Dept",
    description: "Traffic light not cycling properly",
    reporter: "Robert Wilson"
  },
  {
    id: "ISS-2024-005",
    category: "Water Main",
    location: "Elm Street",
    status: "in-progress",
    priority: "high",
    dateReported: "2024-01-11",
    assignedDept: "Water Dept",
    description: "Water main leak flooding street",
    reporter: "Lisa Brown"
  },
];

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
        <CityMapView onMarkerClick={onMarkerClick} issues={mockIssues} />
        
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