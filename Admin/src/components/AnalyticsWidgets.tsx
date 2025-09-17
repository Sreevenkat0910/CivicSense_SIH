import { Card } from "./ui/card";
import { AlertCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";

interface AnalyticsWidgetsProps {
  className?: string;
}

const widgets = [
  {
    title: "Open Issues",
    value: "247",
    change: "+12",
    changeType: "increase" as const,
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "In Progress",
    value: "89",
    change: "+5",
    changeType: "increase" as const,
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Resolved Today",
    value: "34",
    change: "+8",
    changeType: "increase" as const,
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Avg Resolution Time",
    value: "2.3 days",
    change: "-0.5",
    changeType: "decrease" as const,
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export function AnalyticsWidgets({ className }: AnalyticsWidgetsProps) {
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