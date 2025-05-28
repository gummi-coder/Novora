import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Clock, User, Tag } from 'lucide-react';

interface TicketResponse {
  id: string;
  content: string;
  author: string;
  authorRole: string;
  timestamp: string;
  isInternal?: boolean;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  lastResponse?: string;
  responses?: TicketResponse[];
}

interface TicketViewProps {
  ticket: Ticket;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  'open': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'resolved': 'bg-green-100 text-green-800',
  'closed': 'bg-gray-100 text-gray-800'
};

const priorityColors: Record<string, string> = {
  'low': 'bg-gray-100 text-gray-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800'
};

export function TicketView({ ticket, onUpdateTicket, onClose }: TicketViewProps) {
  const [newResponse, setNewResponse] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleAddResponse = () => {
    if (!newResponse.trim()) return;

    const response: TicketResponse = {
      id: `RESP-${Date.now()}`,
      content: newResponse,
      author: 'Current User', // This would come from your auth system
      authorRole: 'Support Agent',
      timestamp: new Date().toISOString(),
      isInternal
    };

    const updatedTicket = {
      ...ticket,
      responses: [...(ticket.responses || []), response],
      lastResponse: new Date().toISOString()
    };

    onUpdateTicket(ticket.id, updatedTicket);
    setNewResponse('');
    setIsInternal(false);
  };

  const handleStatusChange = (newStatus: Ticket['status']) => {
    onUpdateTicket(ticket.id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{ticket.title}</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Ticket #{ticket.id}</span>
            <span>•</span>
            <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{ticket.description}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Category:</span>
                  <Badge variant="outline">{ticket.category}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Assigned to:</span>
                  <span className="text-sm">{ticket.assignedTo}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Status:</span>
                  <Select
                    value={ticket.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge className={priorityColors[ticket.priority]}>
                  {ticket.priority} Priority
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Responses</h3>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {(ticket.responses || []).map((response) => (
                    <div
                      key={response.id}
                      className={`flex space-x-4 ${
                        response.isInternal ? 'opacity-75' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${response.author}`} />
                        <AvatarFallback>
                          {response.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{response.author}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {response.authorRole}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(response.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{response.content}</p>
                        {response.isInternal && (
                          <Badge variant="secondary" className="text-xs">
                            Internal Note
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Add Response</h3>
              </div>
              <Textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Type your response here..."
                className="min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="internal"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="internal" className="text-sm text-muted-foreground">
                    Mark as internal note
                  </label>
                </div>
                <Button onClick={handleAddResponse}>
                  Send Response
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Status</h3>
              <Badge className={statusColors[ticket.status]}>
                {ticket.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Priority</h3>
              <Badge className={priorityColors[ticket.priority]}>
                {ticket.priority}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Category</h3>
              <p className="text-sm">{ticket.category}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Created</h3>
              <p className="text-sm">{new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Last Updated</h3>
              <p className="text-sm">{new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Assigned To</h3>
              <p className="text-sm">{ticket.assignedTo}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Last Response</h3>
              <p className="text-sm">{new Date(ticket.lastResponse!).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 