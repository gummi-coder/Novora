
import React from "react";
import { CalendarEvent } from "@/pages/Calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Users, MapPin, Link2, FileText, Edit, Trash2, Copy } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CalendarEventModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export function CalendarEventModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CalendarEventModalProps) {
  // Get icon based on event type
  const getEventTypeIcon = () => {
    switch (event.type) {
      case 'survey':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'reminder':
        return <CalendarIcon className="h-5 w-5 text-amber-500" />;
      case 'team-event':
        return <Users className="h-5 w-5 text-emerald-500" />;
      case 'holiday':
        return <CalendarIcon className="h-5 w-5 text-violet-500" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = () => {
    switch (event.status) {
      case 'scheduled':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  // Handle duplicate event
  const handleDuplicate = () => {
    const duplicatedEvent = {
      ...event,
      id: `${event.id}-copy`,
      title: `${event.title} (Copy)`,
    };
    onEdit(duplicatedEvent);
    onClose();
  };
  
  // Handle cancel event (mark as cancelled)
  const handleCancel = () => {
    const cancelledEvent = {
      ...event,
      status: 'cancelled' as const,
    };
    onEdit(cancelledEvent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getEventTypeIcon()}
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(event.start, 'PPP')} • {format(event.start, 'p')} - {format(event.end, 'p')}
              </span>
            </div>
            {event.status && (
              <Badge variant={getStatusBadgeVariant() as any}>{event.status}</Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {event.description && (
            <div className="mb-4">
              <p className="text-sm">{event.description}</p>
            </div>
          )}
          
          <div className="space-y-3">
            {/* Event type specific details */}
            {(event.type === 'survey' || event.type === 'reminder') && (
              <>
                {event.surveyId && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Survey ID: {event.surveyId}</span>
                  </div>
                )}
                {event.recipientGroup && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Recipients: {event.recipientGroup}</span>
                  </div>
                )}
                {event.channel && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Channel: {event.channel === 'email' ? 'Email' : 'SMS'}
                    </span>
                  </div>
                )}
                {event.reminderSettings && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reminder: {event.reminderSettings}</span>
                  </div>
                )}
              </>
            )}
            
            {event.type === 'team-event' && (
              <>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Location: {event.location}</span>
                  </div>
                )}
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="text-sm">
                      <div>Attendees:</div>
                      <ul className="list-disc pl-5">
                        {event.attendees.map((attendee, index) => (
                          <li key={index}>{attendee}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <Separator />
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2 order-2 sm:order-1 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            {event.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={handleCancel}
              >
                Cancel Event
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <Button
            variant="default"
            size="sm"
            className="order-1 sm:order-2 w-full sm:w-auto"
            onClick={onClose}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
