import { Clock, CheckCircle, AlertTriangle, XCircle, Eye, MessageCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Report {
  id: string;
  title: string;
  category: string;
  status: 'submitted' | 'in-progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  description: string;
  officialResponse?: string;
  upvotes: number;
}

interface MyReportsDashboardProps {
  reports: Report[];
  onViewDetails: (report: Report) => void;
}

export function MyReportsDashboard({ reports, onViewDetails }: MyReportsDashboardProps) {
  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertTriangle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getStatusProgress = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return 25;
      case 'in-progress': return 60;
      case 'resolved': return 100;
      case 'closed': return 100;
      default: return 0;
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">My Reports</h2>
        <p className="text-muted-foreground">Track the progress of your submitted issues</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
          <p className="text-muted-foreground mb-4">You haven't submitted any issues yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className={`p-4 border-l-4 ${getPriorityColor(report.priority)} hover:shadow-md transition-shadow`}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-base mb-1">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getStatusColor(report.status)} text-xs`}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1 capitalize">{report.status.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{getStatusProgress(report.status)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        report.status === 'resolved' ? 'bg-green-500' : 
                        report.status === 'in-progress' ? 'bg-yellow-500' : 
                        'bg-blue-500'
                      }`}
                      style={{ width: `${getStatusProgress(report.status)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground line-clamp-2">{report.description}</p>

                {/* Official Response */}
                {report.officialResponse && (
                  <div className="bg-accent p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Official Response:</h4>
                    <p className="text-sm text-accent-foreground">{report.officialResponse}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                    <span>{report.upvotes} upvotes</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(report)}
                    className="h-8 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {reports.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reports.filter(r => r.status === 'submitted').length}</div>
            <div className="text-xs text-muted-foreground">Submitted</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'in-progress').length}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'resolved').length}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground">{reports.reduce((sum, r) => sum + r.upvotes, 0)}</div>
            <div className="text-xs text-muted-foreground">Total Upvotes</div>
          </div>
        </div>
      )}
    </Card>
  );
}