import { useState } from 'react';
import { MapPin, ThumbsUp, Clock, AlertTriangle, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Issue {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'submitted' | 'in-progress' | 'resolved' | 'closed';
  upvotes: number;
  timestamp: string;
  location: { x: number; y: number };
}

interface NearbyIssuesMapProps {
  issues: Issue[];
  onUpvote: (issueId: string) => void;
  onReportIssue?: () => void;
}

export function NearbyIssuesMap({ issues, onUpvote, onReportIssue }: NearbyIssuesMapProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'submitted': return <Clock className="w-3 h-3" />;
      case 'in-progress': return <AlertTriangle className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'closed': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Nearby Issues</h2>
          <p className="text-muted-foreground">Click on markers to view issue details</p>
        </div>
        
        {/* Report Issue Button */}
        {onReportIssue && (
          <Button 
            onClick={onReportIssue}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Map Container */}
        <div className="relative bg-muted rounded-lg h-64 md:h-80 overflow-hidden border">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-green-100">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="text-muted-foreground">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Issue Markers */}
          {issues.map((issue) => (
            <button
              key={issue.id}
              className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform ${getPriorityColor(issue.priority)}`}
              style={{
                left: `${issue.location.x}%`,
                top: `${issue.location.y}%`,
              }}
              onClick={() => setSelectedIssue(issue)}
            >
              <MapPin className="w-3 h-3 text-white mx-auto" />
            </button>
          ))}

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-card p-3 rounded-lg shadow-md space-y-2">
            <h4 className="text-sm font-medium">Priority</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Issue Details */}
        {selectedIssue && (
          <Card className="p-4 border-primary">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-base">{selectedIssue.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedIssue.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIssue(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`${getStatusColor(selectedIssue.status)} text-xs`}>
                  {getStatusIcon(selectedIssue.status)}
                  <span className="ml-1 capitalize">{selectedIssue.status.replace('-', ' ')}</span>
                </Badge>
                <Badge variant="outline" className={`${getPriorityColor(selectedIssue.priority)} text-white text-xs`}>
                  {selectedIssue.priority} priority
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedIssue.timestamp).toLocaleDateString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpvote(selectedIssue.id)}
                  className="h-8"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {selectedIssue.upvotes}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Issues List */}
        <div className="max-h-48 overflow-y-auto space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">Recent Issues</h3>
          {issues.slice(0, 5).map((issue) => (
            <div
              key={issue.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedIssue(issue)}
            >
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{issue.title}</p>
                <p className="text-xs text-muted-foreground">{issue.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                <span className="text-xs text-muted-foreground">{issue.upvotes}</span>
                <ThumbsUp className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}