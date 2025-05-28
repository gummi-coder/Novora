import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TicketView } from './TicketView';

type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketCategory = 'Technical' | 'Billing' | 'Feature Request' | 'Account' | 'Other';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  lastResponse?: string;
  responses?: Array<{
    id: string;
    content: string;
    author: string;
    authorRole: string;
    timestamp: string;
    isInternal?: boolean;
  }>;
}

const initialTickets: Ticket[] = [
  {
    id: 'TICK-001',
    title: 'Survey distribution issue',
    description: 'Unable to send surveys to employees via email',
    status: 'open',
    priority: 'high',
    category: 'Technical',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    assignedTo: 'Support Team',
    lastResponse: '2024-03-15T10:30:00Z',
    responses: [
      {
        id: 'RESP-001',
        content: 'We are investigating the issue with email distribution.',
        author: 'John Smith',
        authorRole: 'Support Agent',
        timestamp: '2024-03-15T10:30:00Z'
      }
    ]
  },
  {
    id: 'TICK-002',
    title: 'Analytics dashboard not loading',
    description: 'The analytics dashboard is showing a blank screen',
    status: 'in-progress',
    priority: 'medium',
    category: 'Technical',
    createdAt: '2024-03-14T15:30:00Z',
    updatedAt: '2024-03-15T09:15:00Z',
    assignedTo: 'Technical Team',
    lastResponse: '2024-03-15T09:15:00Z',
    responses: [
      {
        id: 'RESP-002',
        content: 'We have identified the issue and are working on a fix.',
        author: 'Sarah Johnson',
        authorRole: 'Technical Support',
        timestamp: '2024-03-15T09:15:00Z'
      }
    ]
  },
  {
    id: 'TICK-003',
    title: 'Billing inquiry',
    description: 'Need clarification on the latest invoice',
    status: 'open',
    priority: 'low',
    category: 'Billing',
    createdAt: '2024-03-15T11:20:00Z',
    updatedAt: '2024-03-15T11:20:00Z',
    assignedTo: 'Billing Team',
    lastResponse: '2024-03-15T11:20:00Z',
    responses: []
  }
];

const statusColors: Record<TicketStatus, string> = {
  'open': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'resolved': 'bg-green-100 text-green-800',
  'closed': 'bg-gray-100 text-gray-800'
};

const priorityColors: Record<TicketPriority, string> = {
  'low': 'bg-gray-100 text-gray-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800'
};

export function SupportSystem() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '' as TicketStatus | '',
    priority: '' as TicketPriority | '',
    category: '' as TicketCategory | ''
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicket, setNewTicket] = useState<Partial<Ticket>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Technical'
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !filters.status || ticket.status === filters.status;
    const matchesPriority = !filters.priority || ticket.priority === filters.priority;
    const matchesCategory = !filters.category || ticket.category === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleCreateTicket = () => {
    const ticket: Ticket = {
      id: `TICK-${String(tickets.length + 1).padStart(3, '0')}`,
      title: newTicket.title || '',
      description: newTicket.description || '',
      status: 'open',
      priority: newTicket.priority || 'medium',
      category: newTicket.category || 'Technical',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: 'Support Team',
      lastResponse: new Date().toISOString(),
      responses: []
    };

    setTickets([...tickets, ticket]);
    setNewTicket({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Technical'
    });
  };

  const handleUpdateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Detailed description of the issue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value: TicketPriority) => setNewTicket({ ...newTicket, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value: TicketCategory) => setNewTicket({ ...newTicket, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Account">Account</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTicket} className="w-full">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Support Tickets</CardTitle>
            <div className="flex items-center space-x-2">
              <Select
                value={filters.status}
                onValueChange={(value: TicketStatus | '') => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.priority}
                onValueChange={(value: TicketPriority | '') => setFilters({ ...filters, priority: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.category}
                onValueChange={(value: TicketCategory | '') => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Billing">Billing</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="Account">Account</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {(filters.status || filters.priority || filters.category) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status]}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>{ticket.assignedTo}</TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(ticket.lastResponse!).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl">
          {selectedTicket && (
            <TicketView
              ticket={selectedTicket}
              onUpdateTicket={handleUpdateTicket}
              onClose={() => setSelectedTicket(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 