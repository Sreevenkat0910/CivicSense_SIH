import { Card } from "./ui/card";

interface HodDashboardProps {
  departmentName?: string;
}

export function HodDashboard({ departmentName = "Public Works" }: HodDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Head of Department</h1>
          <p className="text-muted-foreground">{departmentName} Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Open Issues</p>
          <p className="text-3xl">42</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">In Progress</p>
          <p className="text-3xl">19</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Resolved (30d)</p>
          <p className="text-3xl">67</p>
        </Card>
      </div>
    </div>
  );
}



