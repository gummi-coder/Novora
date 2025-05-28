
import React, { useState, useCallback, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  id: string;
  name: string;
}

interface AdvancedFiltersProps {
  departments: FilterOption[];
  locations: FilterOption[];
  roles: FilterOption[];
  onFilterChange: (filters: {
    departments: string[];
    locations: string[];
    roles: string[];
  }) => void;
  className?: string;
}

// Memoized filter list to prevent re-rendering
const FilterList = React.memo(({ 
  options, 
  selected, 
  onChange,
  label
}: { 
  options: FilterOption[],
  selected: string[],
  onChange: (id: string) => void,
  label: string
}) => (
  <div>
    <label 
      className="text-sm font-medium pb-1 block"
      id={`${label.toLowerCase()}-label`}
    >
      {label}
    </label>
    <ScrollArea className="h-36 border rounded-md p-2" aria-labelledby={`${label.toLowerCase()}-label`}>
      <div className="space-y-1">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`${label.toLowerCase()}-${option.id}`} 
              checked={selected.includes(option.id)}
              onCheckedChange={() => onChange(option.id)}
            />
            <label 
              htmlFor={`${label.toLowerCase()}-${option.id}`}
              className="text-sm"
            >
              {option.name}
            </label>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
));

FilterList.displayName = "FilterList";

export function AdvancedFilters({
  departments,
  locations,
  roles,
  onFilterChange,
  className
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  // Calculate active filter count only when selections change
  const activeFilterCount = useMemo(() => 
    selectedDepartments.length + selectedLocations.length + selectedRoles.length,
    [selectedDepartments, selectedLocations, selectedRoles]
  );

  // Use callbacks to prevent re-renders
  const handleFilterChange = useCallback(() => {
    onFilterChange({
      departments: selectedDepartments,
      locations: selectedLocations,
      roles: selectedRoles
    });
    setIsExpanded(false);
  }, [selectedDepartments, selectedLocations, selectedRoles, onFilterChange]);

  const handleReset = useCallback(() => {
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedRoles([]);
    onFilterChange({
      departments: [],
      locations: [],
      roles: []
    });
  }, [onFilterChange]);

  const toggleDepartment = useCallback((id: string) => {
    setSelectedDepartments(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  }, []);

  const toggleLocation = useCallback((id: string) => {
    setSelectedLocations(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  }, []);

  const toggleRole = useCallback((id: string) => {
    setSelectedRoles(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  }, []);

  return (
    <div className={className}>
      <Button
        variant="outline"
        className="relative"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="advanced-filters-panel"
      >
        <Filter className="h-4 w-4 mr-2" />
        Advanced Filters
        {activeFilterCount > 0 && (
          <Badge className="ml-2 py-0 px-1.5 h-5" variant="default">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {isExpanded && (
        <Card 
          className="absolute z-50 mt-2 w-[350px] shadow-lg"
          id="advanced-filters-panel"
          role="region"
          aria-label="Advanced filters panel"
        >
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-medium">Advanced Filters</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setIsExpanded(false)}
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <FilterList 
              options={departments}
              selected={selectedDepartments}
              onChange={toggleDepartment}
              label="Departments"
            />
            
            <FilterList 
              options={locations}
              selected={selectedLocations}
              onChange={toggleLocation}
              label="Locations"
            />
            
            <FilterList 
              options={roles}
              selected={selectedRoles}
              onChange={toggleRole}
              label="Roles"
            />

            <div className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                onClick={handleReset}
                aria-label="Reset all filters"
              >
                Reset
              </Button>
              <Button 
                onClick={handleFilterChange}
                aria-label="Apply filters"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
