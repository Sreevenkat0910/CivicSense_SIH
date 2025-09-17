import { Bell, Globe, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  language: string;
}

interface HeaderProps {
  notificationCount: number;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  onNotificationClick: () => void;
  user?: User | null;
  onLogout?: () => void;
}

export function Header({ 
  notificationCount, 
  currentLanguage, 
  onLanguageChange, 
  onNotificationClick, 
  user, 
  onLogout 
}: HeaderProps) {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  return (
    <header className="bg-card border-b border-border px-4 py-4 md:px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {/* App Logo */}
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground text-xl font-bold tracking-tight">CR</span>
          </div>
          
          {/* App Title */}
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
              Civic Issue Reporter
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Empowering Citizens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Selector */}
          <Select value={currentLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32 md:w-40 h-12">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-base py-3">
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Notifications */}
          <Button 
            variant="outline" 
            size="lg"
            className="relative h-12 w-12 p-0"
            onClick={onNotificationClick}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Account Widget */}
          {user && onLogout && (
            <div className="flex items-center gap-1 md:gap-2">
              {/* User Profile Button */}
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-3 hover:bg-muted/30 transition-colors border-border focus:ring-2 focus:ring-primary/20"
                aria-label={`Signed in as ${user.name}`}
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="hidden sm:inline ml-2 font-medium text-foreground max-w-20 truncate">
                  {user.name.split(' ')[0]}
                </span>
              </Button>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={onLogout}
                className="h-12 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-border hover:border-muted-foreground/30"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}