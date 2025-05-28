
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, FileText, Users } from "lucide-react";
import { format, addHours, setHours, setMinutes } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarEvent, EventType } from "@/pages/Calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CalendarCreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  currentDate: Date;
}

export function CalendarCreateEventModal({
  isOpen,
  onClose,
  onCreateEvent,
  currentDate,
}: CalendarCreateEventModalProps) {
  // Default start time is current date at next hour, rounded
  const defaultStartTime = setMinutes(setHours(new Date(currentDate), new Date().getHours() + 1), 0);
  // Default end time is 1 hour after start
  const defaultEndTime = addHours(defaultStartTime, 1);
  
  const [activeTab, setActiveTab] = useState<EventType>("team-event");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartTime);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultEndTime);
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState("");
  const [surveyId, setSurveyId] = useState("");
  const [recipientGroup, setRecipientGroup] = useState("");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [reminderSettings, setReminderSettings] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [step, setStep] = useState(1);

  // Format the date for display
  const formatSelectedDateTime = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "PPP p");
  };

  // Reset the form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(defaultStartTime);
    setEndDate(defaultEndTime);
    setLocation("");
    setAttendees("");
    setSurveyId("");
    setRecipientGroup("");
    setChannel("email");
    setReminderSettings("");
    setAllDay(false);
    setStep(1);
  };

  // Handle closing the modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!startDate || !endDate) return;
    
    // Create new event based on type
    const newEvent: Omit<CalendarEvent, 'id'> = {
      title,
      start: startDate,
      end: endDate,
      type: activeTab,
      status: 'scheduled',
      description,
      allDay,
    };
    
    // Add type-specific properties
    if (activeTab === 'survey' || activeTab === 'reminder') {
      newEvent.surveyId = surveyId;
      newEvent.recipientGroup = recipientGroup;
      newEvent.channel = channel;
      newEvent.reminderSettings = reminderSettings;
    } else if (activeTab === 'team-event') {
      newEvent.location = location;
      newEvent.attendees = attendees.split(',').map(a => a.trim()).filter(a => a);
    }
    
    onCreateEvent(newEvent);
    handleClose();
  };

  // Move to next step
  const handleNext = () => {
    setStep(step + 1);
  };

  // Move to previous step
  const handleBack = () => {
    setStep(step - 1);
  };

  // Check if form is valid for the current step
  const isStepValid = () => {
    if (step === 1) {
      return true; // Type selection is always valid
    } else if (step === 2) {
      if (!title || !startDate || !endDate) return false;
      
      if (activeTab === 'survey' || activeTab === 'reminder') {
        return !!surveyId && !!recipientGroup;
      } else if (activeTab === 'team-event') {
        return true; // Title and dates are already checked
      } else if (activeTab === 'holiday') {
        return true; // Title and dates are already checked
      }
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Create New Event - Select Type"}
            {step === 2 && `Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}`}
            {step === 3 && "Review & Confirm"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as EventType)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="team-event">Team Event</TabsTrigger>
              <TabsTrigger value="survey">Survey</TabsTrigger>
              <TabsTrigger value="reminder">Reminder</TabsTrigger>
              <TabsTrigger value="holiday">Holiday</TabsTrigger>
            </TabsList>
            <TabsContent value="team-event" className="pt-4">
              <div className="flex items-center space-x-4 p-4 bg-accent/30 rounded-lg">
                <Users className="h-10 w-10 text-emerald-500" />
                <div>
                  <h3 className="font-medium">Team Event</h3>
                  <p className="text-sm text-muted-foreground">
                    Schedule meetings, workshops, and other team activities
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="survey" className="pt-4">
              <div className="flex items-center space-x-4 p-4 bg-accent/30 rounded-lg">
                <FileText className="h-10 w-10 text-blue-500" />
                <div>
                  <h3 className="font-medium">Survey</h3>
                  <p className="text-sm text-muted-foreground">
                    Schedule a survey to be sent to your team members
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reminder" className="pt-4">
              <div className="flex items-center space-x-4 p-4 bg-accent/30 rounded-lg">
                <CalendarIcon className="h-10 w-10 text-amber-500" />
                <div>
                  <h3 className="font-medium">Reminder</h3>
                  <p className="text-sm text-muted-foreground">
                    Set reminders for surveys or other important events
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="holiday" className="pt-4">
              <div className="flex items-center space-x-4 p-4 bg-accent/30 rounded-lg">
                <CalendarIcon className="h-10 w-10 text-violet-500" />
                <div>
                  <h3 className="font-medium">Holiday</h3>
                  <p className="text-sm text-muted-foreground">
                    Add company holidays or days off to the calendar
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start</Label>
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="w-24"
                    value={startDate ? format(startDate, "HH:mm") : ""}
                    onChange={(e) => {
                      if (startDate && e.target.value) {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = new Date(startDate);
                        newDate.setHours(hours, minutes);
                        setStartDate(newDate);
                      }
                    }}
                    disabled={allDay}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>End</Label>
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="w-24"
                    value={endDate ? format(endDate, "HH:mm") : ""}
                    onChange={(e) => {
                      if (endDate && e.target.value) {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = new Date(endDate);
                        newDate.setHours(hours, minutes);
                        setEndDate(newDate);
                      }
                    }}
                    disabled={allDay}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="all-day"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="all-day">All day</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            
            {/* Survey and Reminder specific fields */}
            {(activeTab === 'survey' || activeTab === 'reminder') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="survey-id">Survey</Label>
                  <Select value={surveyId} onValueChange={setSurveyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a survey" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="survey-123">Employee Engagement Survey</SelectItem>
                      <SelectItem value="survey-456">Customer Satisfaction Survey</SelectItem>
                      <SelectItem value="survey-789">Team Feedback Survey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient-group">Recipients</Label>
                  <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Employees">All Employees</SelectItem>
                      <SelectItem value="Engineering Team">Engineering Team</SelectItem>
                      <SelectItem value="Marketing Team">Marketing Team</SelectItem>
                      <SelectItem value="Sales Team">Sales Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="channel">Channel</Label>
                  <Select value={channel} onValueChange={(value) => setChannel(value as "email" | "sms")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminder-settings">Reminder</Label>
                  <Select value={reminderSettings} onValueChange={setReminderSettings}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reminder timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No reminder</SelectItem>
                      <SelectItem value="1 hour before">1 hour before</SelectItem>
                      <SelectItem value="1 day before">1 day before</SelectItem>
                      <SelectItem value="2 days before">2 days before</SelectItem>
                      <SelectItem value="1 week before">1 week before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {/* Team Event specific fields */}
            {activeTab === 'team-event' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Physical location or meeting link"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="attendees">Attendees</Label>
                  <Textarea
                    id="attendees"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="Enter attendees, separated by commas"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="bg-accent/30 p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                </Badge>
                <h3 className="font-semibold text-lg">{title}</h3>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {startDate && endDate ? (
                    allDay ? (
                      <span>{format(startDate, "PPP")} (All day)</span>
                    ) : (
                      <span>{format(startDate, "PPP")} • {format(startDate, "p")} - {format(endDate, "p")}</span>
                    )
                  ) : (
                    <span>No date selected</span>
                  )}
                </div>
                
                {description && <p className="mt-2">{description}</p>}
                
                {(activeTab === 'survey' || activeTab === 'reminder') && (
                  <div className="mt-2 space-y-1">
                    <p>Survey: <span className="font-medium">{surveyId === 'survey-123' ? 'Employee Engagement Survey' : surveyId === 'survey-456' ? 'Customer Satisfaction Survey' : surveyId === 'survey-789' ? 'Team Feedback Survey' : surveyId}</span></p>
                    <p>Recipients: <span className="font-medium">{recipientGroup}</span></p>
                    <p>Channel: <span className="font-medium">{channel === 'email' ? 'Email' : 'SMS'}</span></p>
                    {reminderSettings && <p>Reminder: <span className="font-medium">{reminderSettings}</span></p>}
                  </div>
                )}
                
                {activeTab === 'team-event' && (
                  <div className="mt-2 space-y-1">
                    {location && <p>Location: <span className="font-medium">{location}</span></p>}
                    {attendees && (
                      <div>
                        <p>Attendees:</p>
                        <ul className="list-disc pl-5">
                          {attendees.split(',').map((attendee, index) => {
                            const trimmed = attendee.trim();
                            return trimmed ? <li key={index}>{trimmed}</li> : null;
                          }).filter(Boolean)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Create Event
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
