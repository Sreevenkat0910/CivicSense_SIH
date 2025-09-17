import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Coming Soon Content */}
      <Card className="p-12">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Construction className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3>Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This feature is currently under development. Check back soon for updates.
            </p>
          </div>
          
          <Button variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}