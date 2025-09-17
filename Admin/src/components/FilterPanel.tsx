import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { X, Filter } from "lucide-react";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  "Pothole", "Street Light", "Graffiti", "Traffic Signal", 
  "Water Main", "Sidewalk", "Noise Complaint", "Parking", "Litter"
];

const statuses = ["open", "in-progress", "resolved"];
const priorities = ["high", "medium", "low"];
const departments = [
  "Public Works", "Utilities", "Parks & Rec", "Traffic Dept", 
  "Water Dept", "Code Enforcement", "Police"
];

const locations = [
  "Downtown", "North District", "South District", 
  "East Side", "West Side", "Industrial Area"
];

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    }
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    if (checked) {
      setSelectedPriorities([...selectedPriorities, priority]);
    } else {
      setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
    }
  };

  const handleDepartmentChange = (dept: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartments([...selectedDepartments, dept]);
    } else {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedDepartments([]);
    setSelectedLocation("");
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedStatuses.length + 
    selectedPriorities.length + 
    selectedDepartments.length + 
    (selectedLocation ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-background w-80 h-full shadow-xl overflow-y-auto">
        <Card className="h-full rounded-none border-0">
          <div className="p-6 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <h3>Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {activeFiltersCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="mt-3 w-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
          
          <div className="p-6 space-y-6">
            {/* Location Filter */}
            <div>
              <label className="block mb-3">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block mb-3">Status</label>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status, checked as boolean)
                      }
                    />
                    <label htmlFor={`status-${status}`} className="capitalize">
                      {status.replace("-", " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block mb-3">Priority</label>
              <div className="space-y-2">
                {priorities.map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={selectedPriorities.includes(priority)}
                      onCheckedChange={(checked) => 
                        handlePriorityChange(priority, checked as boolean)
                      }
                    />
                    <label htmlFor={`priority-${priority}`} className="capitalize">
                      {priority}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block mb-3">Category</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category, checked as boolean)
                      }
                    />
                    <label htmlFor={`category-${category}`}>
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block mb-3">Department</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={selectedDepartments.includes(dept)}
                      onCheckedChange={(checked) => 
                        handleDepartmentChange(dept, checked as boolean)
                      }
                    />
                    <label htmlFor={`dept-${dept}`}>
                      {dept}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t sticky bottom-0 bg-background">
            <Button className="w-full" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}