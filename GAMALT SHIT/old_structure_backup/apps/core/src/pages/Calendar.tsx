import React, { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views, DateLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";
import { CalendarEventSidebar } from "@/components/calendar/CalendarEventSidebar";
import { CalendarEventModal } from "@/components/calendar/CalendarEventModal";
import { CalendarCreateEventModal } from "@/components/calendar/CalendarCreateEventModal";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// Setup localizer for react-big-calendar
const locales = {
  'en-US': {
    code: 'en-US',
    week: {
      dow: 0, // Sunday is the first day of the week
      doy: 6, // The week that contains Jan 1st is the first week of the year
    }
  }
};

// Event types and interfaces
export type EventType = 'survey' | 'reminder' | 'team-event' | 'holiday';
export type EventStatus = 'scheduled' | 'sent' | 'cancelled' | 'completed';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  status?: EventStatus;
  allDay?: boolean;
  description?: string;
  location?: string;
  attendees?: string[];
  surveyId?: string;
  recipientGroup?: string;
  channel?: 'email' | 'sms';
  reminderSettings?: string;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Create the DnD Calendar component
const DragAndDropCalendar = withDragAndDrop(Calendar);

// Sample events data - expanded with more details
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Employee Engagement Survey',
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    type: 'survey',
    status: 'scheduled',
    description: 'Quarterly employee engagement survey',
    surveyId: 'survey-123',
    recipientGroup: 'All Employees',
    channel: 'email',
    reminderSettings: '1 day before'
  },
  {
    id: '2',
    title: 'Team Building Workshop',
    start: new Date(new Date().setDate(new Date().getDate() + 5)),
    end: new Date(new Date().setDate(new Date().getDate() + 5)),
    type: 'team-event',
    status: 'scheduled',
    description: 'Team building workshop for the engineering department',
    location: 'Conference Room A',
    attendees: ['John Doe', 'Jane Smith', 'Bob Johnson']
  },
  {
    id: '3',
    title: 'Satisfaction Survey Reminder',
    start: new Date(),
    end: new Date(),
    type: 'reminder',
    status: 'scheduled',
    description: 'Reminder for completing the customer satisfaction survey',
    surveyId: 'survey-456'
  },
  {
    id: '4',
    title: 'Memorial Day',
    start: new Date(new Date().setDate(new Date().getDate() + 10)),
    end: new Date(new Date().setDate(new Date().getDate() + 10)),
    type: 'holiday',
    allDay: true,
    status: 'scheduled',
    description: 'Memorial Day - Office Closed'
  }
];

export default function CalendarPage() {
  const [view, setView] = useState<string>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<{
    types: EventType[],
    status: EventStatus[]
  }>({
    types: ['survey', 'reminder', 'team-event', 'holiday'],
    status: ['scheduled', 'sent', 'cancelled', 'completed']
  });
  
  const { toast } = useToast();

  // Handle view change
  const handleViewChange = (newView: string) => {
    setView(newView);
  };
  
  // Handle date navigation
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  // Event style getter based on event type
  const eventStyleGetter = (event: CalendarEvent) => {
    let style: React.CSSProperties = {
      borderRadius: '4px',
      border: 'none',
      padding: '2px 5px',
      fontSize: '0.8rem',
      height: '100%'
    };
    
    switch(event.type) {
      case 'survey':
        style.backgroundColor = '#3b82f6'; // blue-500
        break;
      case 'reminder':
        style.backgroundColor = '#f59e0b'; // amber-500
        break;
      case 'team-event':
        style.backgroundColor = '#10b981'; // emerald-500
        break;
      case 'holiday':
        style.backgroundColor = '#8b5cf6'; // violet-500
        break;
      default:
        style.backgroundColor = '#6b7280'; // gray-500
    }
    
    if (event.status === 'cancelled') {
      style.opacity = 0.5;
      style.textDecoration = 'line-through';
    }
    
    return { style };
  };

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Handle event creation from slot selection
  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setIsCreateEventModalOpen(true);
  };

  // Handle event drag-n-drop rescheduling
  const moveEvent = useCallback(
    ({ event, start, end }: { event: CalendarEvent, start: Date, end: Date }) => {
      const updatedEvents = events.map(existingEvent => 
        existingEvent.id === event.id 
          ? { ...existingEvent, start, end } 
          : existingEvent
      );
      
      setEvents(updatedEvents);
      
      toast({
        title: "Event Rescheduled",
        description: `"${event.title}" has been moved to ${format(start, 'PPP')}`,
      });
    },
    [events, toast]
  );

  // Handle creating new event
  const handleCreateEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const createdEvent = { id, ...newEvent };
    
    setEvents([...events, createdEvent]);
    setIsCreateEventModalOpen(false);
    
    toast({
      title: "Event Created",
      description: `"${newEvent.title}" has been added to the calendar`,
    });
  };

  // Handle editing event
  const handleEditEvent = (updatedEvent: CalendarEvent) => {
    const updatedEvents = events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    
    setEvents(updatedEvents);
    setIsEventModalOpen(false);
    
    toast({
      title: "Event Updated",
      description: `"${updatedEvent.title}" has been updated`,
    });
  };

  // Handle deletion of event
  const handleDeleteEvent = (eventId: string) => {
    const eventToDelete = events.find(event => event.id === eventId);
    const updatedEvents = events.filter(event => event.id !== eventId);
    
    setEvents(updatedEvents);
    setIsEventModalOpen(false);
    
    toast({
      title: "Event Deleted",
      description: eventToDelete ? `"${eventToDelete.title}" has been removed` : "Event has been removed",
    });
  };

  // Format for toolbar title based on view and date
  const formatToolbarTitle = (date: Date, view: string) => {
    switch(view) {
      case Views.MONTH:
        return format(date, 'MMMM yyyy');
      case Views.WEEK:
        return `Week of ${format(date, 'MMM d, yyyy')}`;
      case Views.DAY:
        return format(date, 'MMMM d, yyyy');
      case Views.AGENDA:
        return 'Agenda';
      default:
        return '';
    }
  };

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Apply search filter
      const matchesSearch = searchTerm === "" || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply type filter
      const matchesType = selectedFilter.types.includes(event.type);
      
      // Apply status filter
      const matchesStatus = !event.status || selectedFilter.status.includes(event.status);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchTerm, selectedFilter]);

  // Custom toolbar component
  const CustomToolbar = ({ onView, onNavigate, label }: any) => {
    return (
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('TODAY')}
          >
            Today
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onNavigate('PREV')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onNavigate('NEXT')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <span className="text-lg font-medium">{label}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={isSidebarOpen ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="sm:hidden"
          >
            {isSidebarOpen ? <X className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
            {isSidebarOpen ? "Hide Filters" : "Show Filters"}
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={view === Views.MONTH ? "default" : "outline"}
              size="sm" 
              onClick={() => onView(Views.MONTH)}
            >
              Month
            </Button>
            <Button 
              variant={view === Views.WEEK ? "default" : "outline"}
              size="sm" 
              onClick={() => onView(Views.WEEK)}
            >
              Week
            </Button>
            <Button 
              variant={view === Views.DAY ? "default" : "outline"}
              size="sm" 
              onClick={() => onView(Views.DAY)}
            >
              Day
            </Button>
            <Button 
              variant={view === Views.AGENDA ? "default" : "outline"}
              size="sm" 
              onClick={() => onView(Views.AGENDA)}
            >
              Agenda
            </Button>
          </div>
          
          <Button 
            className="flex items-center gap-1"
            onClick={() => setIsCreateEventModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>
    );
  };

  // Component for rendering event content with tooltip
  const EventComponent = ({ event }: any) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between h-full w-full">
            <span className="truncate">{event.title}</span>
            {event.status && (
              <Badge 
                variant="outline" 
                className="ml-1 text-xs whitespace-nowrap bg-white/20"
              >
                {event.status}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-4">
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">{event.title}</h4>
            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span>Time:</span>
                <span>{format(event.start, 'p')} - {format(event.end, 'p')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type:</span>
                <Badge variant="outline">{event.type}</Badge>
              </div>
              {event.status && (
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge>{event.status}</Badge>
                </div>
              )}
              {event.description && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Calendar</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Event sidebar - collapsible on mobile */}
          {isSidebarOpen && (
            <div className="w-full md:w-80 shrink-0">
              <CalendarEventSidebar 
                events={events}
                filteredEvents={filteredEvents}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                onSelectEvent={handleSelectEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            </div>
          )}
          
          {/* Main calendar card */}
          <Card className="p-4 flex-grow">
            <div className="h-[700px]">
              <DndProvider backend={HTML5Backend}>
                <DragAndDropCalendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor={(event: any) => new Date(event.start)}
                  endAccessor={(event: any) => new Date(event.end)}
                  style={{ height: '100%' }}
                  views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                  view={view as any}
                  date={date}
                  onView={handleViewChange}
                  onNavigate={handleNavigate}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable={true}
                  onEventDrop={moveEvent}
                  components={{
                    toolbar: CustomToolbar,
                    event: EventComponent as any,
                  }}
                  formats={{
                    dayFormat: 'dd',
                    timeGutterFormat: 'h:mm a',
                    eventTimeRangeFormat: ({ start, end }) => {
                      return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
                    },
                  }}
                  popup={true}
                />
              </DndProvider>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Event detail modal */}
      {selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}
      
      {/* Create event modal */}
      <CalendarCreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onCreateEvent={handleCreateEvent}
        currentDate={date}
      />
    </DashboardLayout>
  );
}
