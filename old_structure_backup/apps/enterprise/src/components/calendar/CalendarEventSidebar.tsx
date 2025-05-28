
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isTomorrow, isThisWeek, addDays, startOfDay, isSameDay } from "date-fns";
import { CalendarEvent, EventType, EventStatus } from "@/pages/Calendar";
import { Search, X, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarEventSidebarProps {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedFilter: {
    types: EventType[];
    status: EventStatus[];
  };
  setSelectedFilter: (filter: { types: EventType[]; status: EventStatus[] }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function CalendarEventSidebar({
  events,
  filteredEvents,
  searchTerm,
  setSearchTerm,
  selectedFilter,
  setSelectedFilter,
  onSelectEvent,
  onDeleteEvent,
}: CalendarEventSidebarProps) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Group events by date
  const groupedEvents = filteredEvents.reduce<{ [key: string]: CalendarEvent[] }>(
    (groups, event) => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
      return groups;
    },
    {}
  );

  // Sort the dates chronologically
  const sortedDates = Object.keys(groupedEvents).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Generate human-readable date headings
  const getDateHeading = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
    return format(date, 'MMM d, yyyy');
  };

  // Handle type filter change
  const handleTypeFilterChange = (type: EventType) => {
    if (selectedFilter.types.includes(type)) {
      setSelectedFilter({
        ...selectedFilter,
        types: selectedFilter.types.filter((t) => t !== type)
      });
    } else {
      setSelectedFilter({
        ...selectedFilter,
        types: [...selectedFilter.types, type]
      });
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: EventStatus) => {
    if (selectedFilter.status.includes(status)) {
      setSelectedFilter({
        ...selectedFilter,
        status: selectedFilter.status.filter((s) => s !== status)
      });
    } else {
      setSelectedFilter({
        ...selectedFilter,
        status: [...selectedFilter.status, status]
      });
    }
  };

  // Handle event selection
  const handleEventSelection = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((id) => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  // Get color class for event type
  const getEventTypeColorClass = (type: EventType) => {
    switch (type) {
      case 'survey':
        return 'bg-blue-500';
      case 'reminder':
        return 'bg-amber-500';
      case 'team-event':
        return 'bg-emerald-500';
      case 'holiday':
        return 'bg-violet-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle bulk actions
  const handleBulkDelete = () => {
    selectedEvents.forEach(id => onDeleteEvent(id));
    setSelectedEvents([]);
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Event Type</h3>
            <div className="flex flex-wrap gap-2">
              {(['survey', 'reminder', 'team-event', 'holiday'] as EventType[]).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-type-${type}`}
                    checked={selectedFilter.types.includes(type)}
                    onCheckedChange={() => handleTypeFilterChange(type)}
                  />
                  <label
                    htmlFor={`filter-type-${type}`}
                    className="text-sm flex items-center cursor-pointer"
                  >
                    <span
                      className={`h-3 w-3 rounded-full inline-block mr-1 ${getEventTypeColorClass(
                        type
                      )}`}
                    ></span>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {(['scheduled', 'sent', 'cancelled', 'completed'] as EventStatus[]).map(
                (status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-status-${status}`}
                      checked={selectedFilter.status.includes(status)}
                      onCheckedChange={() => handleStatusFilterChange(status)}
                    />
                    <label
                      htmlFor={`filter-status-${status}`}
                      className="text-sm cursor-pointer"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </label>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedEvents.length > 0 && (
        <div className="p-4 border-b bg-accent/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedEvents.length} event{selectedEvents.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvents([])}>
                Clear
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No events match your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  {getDateHeading(dateKey)}
                </h3>
                <div className="space-y-2">
                  {groupedEvents[dateKey].map((event) => (
                    <div
                      key={event.id}
                      className={`p-2 rounded-md border ${
                        selectedEvents.includes(event.id) ? 'bg-accent' : ''
                      } hover:bg-accent/50 transition-colors relative group`}
                    >
                      <div className="flex items-start">
                        <Checkbox
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={() => handleEventSelection(event.id)}
                          className="mr-2 mt-1"
                        />
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => onSelectEvent(event)}
                        >
                          <div className="flex items-center">
                            <span
                              className={`h-3 w-3 rounded-full mr-2 ${getEventTypeColorClass(
                                event.type
                              )}`}
                            ></span>
                            <span
                              className={`font-medium ${
                                event.status === 'cancelled' ? 'line-through opacity-50' : ''
                              }`}
                            >
                              {event.title}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex justify-between items-center">
                            <span>
                              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                            </span>
                            {event.status && (
                              <Badge variant="outline" className="text-xs">
                                {event.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSelectEvent(event)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeleteEvent(event.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
