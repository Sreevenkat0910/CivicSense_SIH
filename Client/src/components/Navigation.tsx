import { FileText, Map, User, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  activeTab: 'report' | 'map' | 'dashboard';
  onTabChange: (tab: 'report' | 'map' | 'dashboard') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'report' as const, label: 'Report Issue', icon: Plus },
    { id: 'map' as const, label: 'Nearby Issues', icon: Map },
    { id: 'dashboard' as const, label: 'My Reports', icon: User },
  ];

  return (
    <nav className="bg-card border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center md:justify-start">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 h-10 text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}