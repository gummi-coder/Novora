import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Plus, Pencil, MoveRight, Archive, Mail, MoreHorizontal, Users, Send, Trash2, Edit, UserPlus } from "lucide-react";
import { api } from "@/lib/api";

type EmployeeStatus = "Invited" | "Active" | "Bounced" | "Archived";
type EmployeeRole = "employee" | "manager";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  team: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  lastSurveySent?: string;
  lastResponse?: string;
  locale?: string;
  timezone?: string;
  employmentType?: string;
}

interface CsvPreviewRow {
  rowIndex: number;
  data: Partial<Employee> & { email?: string };
  status: "new" | "update" | "error";
  errorMessage?: string;
}

const statusBadgeClass = (s: EmployeeStatus) => {
  switch (s) {
    case "Invited":
      return "bg-blue-100 text-blue-700";
    case "Active":
      return "bg-green-100 text-green-700";
    case "Bounced":
      return "bg-yellow-100 text-yellow-700";
    case "Archived":
      return "bg-gray-200 text-gray-700";
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneE164Regex = /^\+?[1-9]\d{7,14}$/; // simple E.164-like

const sampleCsv = `first_name,last_name,email,phone,position,team,role,locale,timezone\nAna,Gomez,ana@acme.com,+34600111222,Designer,Product,employee,es-ES,Europe/Madrid\nLuis,Perez,luis@acme.com,,Sales Lead,Sales,manager,es-ES,Europe/Madrid\nMarta,Ruiz,marta@acme.com,+34600999888,HR Generalist,People,employee,en-GB,Europe/Madrid`;

const Employees = () => {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [autoCreateTeam, setAutoCreateTeam] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CsvPreviewRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // New state for modals and actions
  const [showAssignTeamModal, setShowAssignTeamModal] = useState(false);
  const [showMoveTeamModal, setShowMoveTeamModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [availableTeams] = useState(["Engineering", "Sales", "Marketing", "HR", "Finance", "Product", "Support", "Design"]);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock employee data
        const mockEmployees: Employee[] = [
          {
            id: "1",
            firstName: "Sarah",
            lastName: "Johnson",
            email: "sarah.johnson@novora.com",
            phone: "+15551234567",
            position: "Senior Software Engineer",
            team: "Engineering",
            role: "employee",
            status: "Active",
            lastSurveySent: "2024-01-15",
            lastResponse: "2024-01-16",
            locale: "en-US",
            timezone: "America/New_York",
            employmentType: "Full-time"
          },
          {
            id: "2",
            firstName: "Michael",
            lastName: "Chen",
            email: "michael.chen@novora.com",
            phone: "+15551234568",
            position: "Product Manager",
            team: "Product",
            role: "manager",
            status: "Active",
            lastSurveySent: "2024-01-10",
            lastResponse: "2024-01-11",
            locale: "en-US",
            timezone: "America/Los_Angeles",
            employmentType: "Full-time"
          },
          {
            id: "3",
            firstName: "Emily",
            lastName: "Rodriguez",
            email: "emily.rodriguez@novora.com",
            phone: "+15551234569",
            position: "UX Designer",
            team: "Design",
            role: "employee",
            status: "Active",
            lastSurveySent: "2024-01-12",
            lastResponse: "2024-01-13",
            locale: "en-US",
            timezone: "America/Chicago",
            employmentType: "Full-time"
          },
          {
            id: "4",
            firstName: "David",
            lastName: "Kim",
            email: "david.kim@novora.com",
            phone: "+15551234570",
            position: "Sales Director",
            team: "Sales",
            role: "manager",
            status: "Active",
            lastSurveySent: "2024-01-08",
            lastResponse: "2024-01-09",
            locale: "en-US",
            timezone: "America/New_York",
            employmentType: "Full-time"
          },
          {
            id: "5",
            firstName: "Lisa",
            lastName: "Thompson",
            email: "lisa.thompson@novora.com",
            phone: "+15551234571",
            position: "Marketing Specialist",
            team: "Marketing",
            role: "employee",
            status: "Invited",
            lastSurveySent: undefined,
            lastResponse: undefined,
            locale: "en-US",
            timezone: "America/Denver",
            employmentType: "Full-time"
          },
          {
            id: "6",
            firstName: "James",
            lastName: "Wilson",
            email: "james.wilson@novora.com",
            phone: "+15551234572",
            position: "HR Manager",
            team: "HR",
            role: "manager",
            status: "Active",
            lastSurveySent: "2024-01-14",
            lastResponse: "2024-01-15",
            locale: "en-US",
            timezone: "America/New_York",
            employmentType: "Full-time"
          },
          {
            id: "7",
            firstName: "Maria",
            lastName: "Garcia",
            email: "maria.garcia@novora.com",
            phone: "+15551234573",
            position: "Data Analyst",
            team: "Engineering",
            role: "employee",
            status: "Active",
            lastSurveySent: "2024-01-13",
            lastResponse: "2024-01-14",
            locale: "es-ES",
            timezone: "America/Mexico_City",
            employmentType: "Full-time"
          },
          {
            id: "8",
            firstName: "Robert",
            lastName: "Brown",
            email: "robert.brown@novora.com",
            phone: "+15551234574",
            position: "Customer Success Manager",
            team: "Support",
            role: "manager",
            status: "Active",
            lastSurveySent: "2024-01-11",
            lastResponse: "2024-01-12",
            locale: "en-US",
            timezone: "America/Chicago",
            employmentType: "Full-time"
          },
          {
            id: "9",
            firstName: "Jennifer",
            lastName: "Davis",
            email: "jennifer.davis@novora.com",
            phone: "+15551234575",
            position: "Frontend Developer",
            team: "Engineering",
            role: "employee",
            status: "Bounced",
            lastSurveySent: "2024-01-09",
            lastResponse: undefined,
            locale: "en-US",
            timezone: "America/Los_Angeles",
            employmentType: "Full-time"
          },
          {
            id: "10",
            firstName: "Alex",
            lastName: "Martinez",
            email: "alex.martinez@novora.com",
            phone: "+15551234576",
            position: "Content Writer",
            team: "Marketing",
            role: "employee",
            status: "Invited",
            lastSurveySent: undefined,
            lastResponse: undefined,
            locale: "en-US",
            timezone: "America/Denver",
            employmentType: "Part-time"
          },
          {
            id: "11",
            firstName: "Rachel",
            lastName: "Taylor",
            email: "rachel.taylor@novora.com",
            phone: "+15551234577",
            position: "Finance Analyst",
            team: "Finance",
            role: "employee",
            status: "Active",
            lastSurveySent: "2024-01-16",
            lastResponse: "2024-01-17",
            locale: "en-US",
            timezone: "America/New_York",
            employmentType: "Full-time"
          },
          {
            id: "12",
            firstName: "Thomas",
            lastName: "Anderson",
            email: "thomas.anderson@novora.com",
            phone: "+15551234578",
            position: "DevOps Engineer",
            team: "Engineering",
            role: "employee",
            status: "Active",
            lastSurveySent: "2024-01-14",
            lastResponse: "2024-01-15",
            locale: "en-US",
            timezone: "America/Los_Angeles",
            employmentType: "Full-time"
          },
          {
            id: "13",
            firstName: "Amanda",
            lastName: "White",
            email: "amanda.white@novora.com",
            phone: "+15551234579",
            position: "Recruiter",
            team: "HR",
            role: "employee",
            status: "Active",
            lastSurveySent: "2024-01-12",
            lastResponse: "2024-01-13",
            locale: "en-US",
            timezone: "America/Chicago",
            employmentType: "Full-time"
          },
          {
            id: "14",
            firstName: "Christopher",
            lastName: "Lee",
            email: "christopher.lee@novora.com",
            phone: "+15551234580",
            position: "Backend Developer",
            team: "Engineering",
            role: "employee",
            status: "Archived",
            lastSurveySent: "2023-12-15",
            lastResponse: "2023-12-16",
            locale: "en-US",
            timezone: "America/New_York",
            employmentType: "Full-time"
          },
          {
            id: "15",
            firstName: "Jessica",
            lastName: "Clark",
            email: "jessica.clark@novora.com",
            phone: "+15551234581",
            position: "Brand Manager",
            team: "Marketing",
            role: "manager",
            status: "Active",
            lastSurveySent: "2024-01-10",
            lastResponse: "2024-01-11",
            locale: "en-US",
            timezone: "America/Los_Angeles",
            employmentType: "Full-time"
          }
        ];
        
        setEmployees(mockEmployees);
      } catch (e) {
        // fallback to empty
        setEmployees([]);
      }
    };
    fetchUsers();
  }, []);

  const teams = useMemo(() => {
    const set = new Set(employees.map((e) => e.team));
    return Array.from(set);
  }, [employees]);

  const filtered = employees.filter((e) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = `${e.firstName} ${e.lastName} ${e.email} ${e.phone || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (teamFilter !== "all" && e.team !== teamFilter) return false;
    if (statusFilter !== "all" && e.status !== (statusFilter as EmployeeStatus)) return false;
    if (roleFilter !== "all" && e.role !== (roleFilter as EmployeeRole)) return false;
    return true;
  });

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filtered.map((e) => e.id)));
    else setSelectedIds(new Set());
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const startAdd = () => { setEditing(null); setShowAddEditModal(true); };
  const startEdit = (emp: Employee) => { setEditing(emp); setShowAddEditModal(true); };

  const handleSave = async (data: Partial<Employee>) => {
    // validation
    if (!data.email || !emailRegex.test(data.email)) {
      alert("Valid email is required"); return;
    }
    if (!data.team) { alert("Team is required"); return; }
    if (data.phone && !phoneE164Regex.test(data.phone)) { alert("Phone must be E.164 format e.g. +15551234567"); return; }

    try {
      if (editing) {
        // Map to admin update fields
        await api.updateAdminUser(Number(editing.id), {
          email: data.email || editing.email,
          company_name: data.team || editing.team,
          role: data.role === 'manager' ? 'admin' : 'core',
        });
      } else {
        // dedupe
        if (employees.some((e) => e.email.toLowerCase() === data.email!.toLowerCase())) {
          alert("Email already exists"); return;
        }
        // Create via register with random temp password
        const tempPassword = Math.random().toString(36).slice(2, 10) + "A1!";
        await api.register(data.email!, tempPassword, data.team || "");
      }
      // refresh list
      const refreshed = await api.getAdminUsers({ limit: 100 });
      const mapped: Employee[] = refreshed.map((u) => ({
        id: String(u.id),
        firstName: u.email.split('@')[0],
        lastName: "",
        email: u.email,
        phone: "",
        position: "",
        team: u.company_name || "-",
        role: (u.role === 'admin' ? 'manager' : 'employee'),
        status: u.is_active ? "Active" : "Archived",
      }));
      setEmployees(mapped);
      setShowAddEditModal(false);
    } catch (e) {
      alert('Failed to save employee');
    }
  };

  const resendInvites = () => {
    toast({
      title: "Invites Resent",
      description: `Successfully resent invites to ${selectedIds.size} employee(s)`,
    });
  };

  const archiveSelected = () => {
    setEmployees((prev) => prev.map((e) => selectedIds.has(e.id) ? { ...e, status: "Archived" } : e));
    setSelectedIds(new Set());
    toast({
      title: "Employees Archived",
      description: `Successfully archived ${selectedIds.size} employee(s)`,
    });
  };

  const handleAssignToTeam = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select employees to assign to a team",
        variant: "destructive",
      });
      return;
    }
    setShowAssignTeamModal(true);
  };

  const handleConfirmAssignTeam = () => {
    if (!selectedTeam) {
      toast({
        title: "No Team Selected",
        description: "Please select a team to assign employees to",
        variant: "destructive",
      });
      return;
    }
    
    setEmployees((prev) => prev.map((e) => 
      selectedIds.has(e.id) ? { ...e, team: selectedTeam } : e
    ));
    setSelectedIds(new Set());
    setShowAssignTeamModal(false);
    setSelectedTeam("");
    
    toast({
      title: "Team Assignment Complete",
      description: `Successfully assigned ${selectedIds.size} employee(s) to ${selectedTeam}`,
    });
  };

  const handleMoveTeam = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedTeam(employee.team);
    setShowMoveTeamModal(true);
  };

  const handleConfirmMoveTeam = () => {
    if (!selectedEmployee || !selectedTeam) return;
    
    setEmployees((prev) => prev.map((e) => 
      e.id === selectedEmployee.id ? { ...e, team: selectedTeam } : e
    ));
    setShowMoveTeamModal(false);
    setSelectedEmployee(null);
    setSelectedTeam("");
    
    toast({
      title: "Team Moved",
      description: `Successfully moved ${selectedEmployee.firstName} ${selectedEmployee.lastName} to ${selectedTeam}`,
    });
  };

  const handleResendInvite = (employee: Employee) => {
    toast({
      title: "Invite Resent",
      description: `Successfully resent invite to ${employee.email}`,
    });
  };

  const handleArchiveEmployee = (employee: Employee) => {
    setEmployees((prev) => prev.map((e) => 
      e.id === employee.id ? { ...e, status: "Archived" } : e
    ));
    
    toast({
      title: "Employee Archived",
      description: `Successfully archived ${employee.firstName} ${employee.lastName}`,
    });
  };

  const exportCsv = () => {
    const header = ["first_name","last_name","email","phone","position","team","role","locale","timezone","status"].join(",");
    const rows = filtered.map((e) => [
      e.firstName, 
      e.lastName, 
      e.email, 
      e.phone || "", 
      e.position || "", 
      e.team, 
      e.role, 
      e.locale || "", 
      e.timezone || "",
      e.status
    ].map((v) => (v ?? "")).join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`; 
    a.click(); 
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Successfully exported ${filtered.length} employees to CSV`,
    });
  };

  const handleFileChosen = async (file: File) => {
    const text = await file.text();
    setCsvText(text);
    parseCsv(text);
  };

  const parseCsv = (text: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) { setCsvPreview([]); return; }
      const header = lines[0].split(",").map((h) => h.trim());
      const requiredIdx = {
        first_name: header.indexOf("first_name"),
        last_name: header.indexOf("last_name"),
        email: header.indexOf("email"),
        phone: header.indexOf("phone"),
        position: header.indexOf("position"),
        team: header.indexOf("team"),
        role: header.indexOf("role"),
        locale: header.indexOf("locale"),
        timezone: header.indexOf("timezone"),
      };
      const preview: CsvPreviewRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const row: Partial<Employee> = {
          firstName: cols[requiredIdx.first_name]?.trim(),
          lastName: cols[requiredIdx.last_name]?.trim(),
          email: cols[requiredIdx.email]?.trim(),
          phone: cols[requiredIdx.phone]?.trim() || undefined,
          position: cols[requiredIdx.position]?.trim() || undefined,
          team: cols[requiredIdx.team]?.trim(),
          role: (cols[requiredIdx.role]?.trim() as EmployeeRole) || "employee",
          locale: cols[requiredIdx.locale]?.trim() || undefined,
          timezone: cols[requiredIdx.timezone]?.trim() || undefined,
          status: "Invited",
        };
        let status: CsvPreviewRow["status"] = "new";
        let errorMessage: string | undefined;
        if (!row.email || !emailRegex.test(row.email)) {
          status = "error"; errorMessage = "Invalid or missing email";
        } else if (!row.team && !autoCreateTeam) {
          status = "error"; errorMessage = "Team required (or enable auto-create)";
        } else if (row.phone && !phoneE164Regex.test(row.phone)) {
          status = "error"; errorMessage = "Invalid phone format";
        } else if (employees.some((e) => e.email.toLowerCase() === row.email!.toLowerCase())) {
          status = "update";
        }
        preview.push({ rowIndex: i, data: { email: row.email, ...row }, status, errorMessage });
      }
      setCsvPreview(preview);
    } catch (e) {
      setCsvPreview([{ rowIndex: 0, data: {}, status: "error", errorMessage: "Failed to parse CSV" }]);
    }
  };

  const applyCsv = () => {
    if (!csvPreview) return;
    const next = [...employees];
    for (const row of csvPreview) {
      if (row.status === "error") continue;
      const d = row.data;
      const existsIdx = next.findIndex((e) => e.email.toLowerCase() === (d.email || "").toLowerCase());
      if (existsIdx >= 0) {
        next[existsIdx] = { ...next[existsIdx], ...d } as Employee;
      } else {
        next.unshift({
          id: Math.random().toString(36).slice(2, 10),
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          email: d.email!,
          phone: d.phone,
          position: d.position,
          team: d.team || (autoCreateTeam ? "Unknown" : ""),
          role: (d.role as EmployeeRole) || "employee",
          status: "Invited",
          locale: d.locale,
          timezone: d.timezone,
        });
      }
    }
    setEmployees(next);
    setImportOpen(false);
    setCsvPreview(null);
    setCsvText("");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Employee Management Board with Filters */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <Users className="w-6 h-6 text-gray-700" />
                Employee Management
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Manage employees, invitations and team assignments across your organization
              </CardDescription>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-gray-200 bg-white/50 backdrop-blur-sm"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" /> Import CSV
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-200 bg-white/50 backdrop-blur-sm"
                onClick={exportCsv}
              >
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={startAdd}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end mb-6">
            <div className="md:col-span-2">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Search</Label>
              <Input 
                className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm" 
                placeholder="Search name, email, phone" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Team</Label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Invited">Invited</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Bounced">Bounced</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Selected: <span className="text-blue-600 font-semibold">{selectedIds.size}</span> employee{selectedIds.size !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAssignToTeam}
                  className="border-gray-200 bg-white/50 backdrop-blur-sm"
                >
                  <Users className="w-4 h-4 mr-2" /> Assign to team
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resendInvites}
                  className="border-gray-200 bg-white/50 backdrop-blur-sm"
                >
                  <Mail className="w-4 h-4 mr-2" /> Resend invites
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={archiveSelected}
                  className="border-gray-200 bg-white/50 backdrop-blur-sm"
                >
                  <Archive className="w-4 h-4 mr-2" /> Archive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Table */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    <th className="py-4 px-4"><Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={(v) => toggleAll(Boolean(v))} /></th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Phone</th>
                    <th className="py-4 px-4">Position</th>
                    <th className="py-4 px-4">Team</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Last Survey Sent</th>
                    <th className="py-4 px-4">Last Response</th>
                    <th className="py-4 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="py-4 px-4"><Checkbox checked={selectedIds.has(e.id)} onCheckedChange={(v) => toggleOne(e.id, Boolean(v))} /></td>
                      <td className="py-4 px-4 font-medium text-gray-900">{e.firstName} {e.lastName}</td>
                      <td className="py-4 px-4 text-gray-700">{e.email}</td>
                      <td className="py-4 px-4 text-gray-600">{e.phone || "-"}</td>
                      <td className="py-4 px-4 text-gray-600">{e.position || "-"}</td>
                      <td className="py-4 px-4 text-gray-700">{e.team}</td>
                      <td className="py-4 px-4">
                        <Badge className={`${statusBadgeClass(e.status)} px-2 py-1 text-xs font-medium`}>
                          {e.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{e.lastSurveySent || "-"}</td>
                      <td className="py-4 px-4 text-gray-600">{e.lastResponse || "-"}</td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => startEdit(e)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendInvite(e)}>
                              <Send className="w-4 h-4 mr-2" />
                              Resend Invite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveTeam(e)}>
                              <MoveRight className="w-4 h-4 mr-2" />
                              Move Team
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleArchiveEmployee(e)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-gray-700 font-medium text-lg">No employees found</div>
                <div className="text-sm text-gray-500 max-w-md mx-auto">
                  {employees.length === 0 ? "Import from CSV or add manually to get started" : "Try clearing filters or importing from CSV"}
                </div>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setImportOpen(true)}
                    className="border-gray-200 bg-white/50 backdrop-blur-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Import CSV
                  </Button>
                  <Button 
                    onClick={startAdd}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Employee
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Modal for Add/Edit */}
      <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <span>{editing ? "Edit Employee" : "Add Employee"}</span>
            </DialogTitle>
            <DialogDescription>
              {editing ? "Update employee information" : "Add a new employee to your organization"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">First name</Label>
                <Input 
                  className="mt-1" 
                  defaultValue={editing?.firstName} 
                  onChange={(e) => editing && (editing.firstName = e.target.value)} 
                  placeholder="John"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Last name</Label>
                <Input 
                  className="mt-1" 
                  defaultValue={editing?.lastName} 
                  onChange={(e) => editing && (editing.lastName = e.target.value)} 
                  placeholder="Doe"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">Email *</Label>
                <Input 
                  className="mt-1" 
                  defaultValue={editing?.email} 
                  onChange={(e) => editing && (editing.email = e.target.value)} 
                  placeholder="john.doe@company.com"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                <Input 
                  className="mt-1" 
                  defaultValue={editing?.phone} 
                  onChange={(e) => editing && (editing.phone = e.target.value)} 
                  placeholder="+15551234567" 
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Position/Title</Label>
                <Input 
                  className="mt-1" 
                  defaultValue={editing?.position} 
                  onChange={(e) => editing && (editing.position = e.target.value)} 
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Team *</Label>
                <Select defaultValue={editing?.team || ""} onValueChange={(v) => editing && (editing.team = v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((team) => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Role</Label>
                <Select defaultValue={editing?.role || "employee"} onValueChange={(v) => editing && (editing.role = v as EmployeeRole)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Locale</Label>
                <Input 
                  className="mt-1" 
                  defaultValue={editing?.locale} 
                  onChange={(e) => editing && (editing.locale = e.target.value)} 
                  placeholder="en-US" 
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Timezone</Label>
                <Input 
                  className="mt-1" 
                  defaultValue={editing?.timezone} 
                  onChange={(e) => editing && (editing.timezone = e.target.value)} 
                  placeholder="America/New_York" 
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Employment type</Label>
                <Input 
                  className="mt-1" 
                  defaultValue={editing?.employmentType} 
                  onChange={(e) => editing && (editing.employmentType = e.target.value)} 
                  placeholder="FT / PT / Contractor" 
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleSave(editing || {})}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editing ? "Update Employee" : "Add Employee"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Employees from CSV</DialogTitle>
            <DialogDescription>Template columns: first_name,last_name,email,phone,position,team,role,locale,timezone</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input type="file" ref={fileInputRef} accept=".csv,text/csv" onChange={(e) => e.target.files && handleFileChosen(e.target.files[0])} />
              <Button variant="outline" onClick={() => { setCsvText(sampleCsv); parseCsv(sampleCsv); }}>Use sample</Button>
              <Button variant="outline" onClick={() => { setCsvText(""); setCsvPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Clear</Button>
            </div>
            <div>
              <Label>CSV Text</Label>
              <textarea className="mt-1 w-full h-40 border rounded p-2 font-mono text-sm" value={csvText} onChange={(e) => { setCsvText(e.target.value); parseCsv(e.target.value); }} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" checked={autoCreateTeam} onChange={(e) => setAutoCreateTeam(e.target.checked)} />
              <span>Auto-create team if missing</span>
            </label>
            {csvPreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    New: {csvPreview.filter((r) => r.status === "new").length} • Updates: {csvPreview.filter((r) => r.status === "update").length} • Errors: {csvPreview.filter((r) => r.status === "error").length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-sm text-gray-500">
                          <th className="py-2">Row</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Team</th>
                          <th className="py-2">Role</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((r) => (
                          <tr key={r.rowIndex} className="border-t">
                            <td className="py-2">{r.rowIndex + 1}</td>
                            <td className="py-2">{r.data.email}</td>
                            <td className="py-2">{r.data.team || "-"}</td>
                            <td className="py-2">{r.data.role || "employee"}</td>
                            <td className="py-2">{r.status}</td>
                            <td className="py-2">{r.errorMessage || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportOpen(false)} className="border-gray-200 bg-white/50 backdrop-blur-sm">Cancel</Button>
              <Button onClick={applyCsv} disabled={!csvPreview || csvPreview.length === 0} className="bg-blue-600 hover:bg-blue-700">Apply Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Team Modal */}
      <Dialog open={showAssignTeamModal} onOpenChange={setShowAssignTeamModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Assign to Team</span>
            </DialogTitle>
            <DialogDescription>
              Assign {selectedIds.size} selected employee{selectedIds.size !== 1 ? 's' : ''} to a team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Select Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((team) => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignTeamModal(false)} className="border-gray-200 bg-white/50 backdrop-blur-sm">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAssignTeam}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Assign to Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Team Modal */}
      <Dialog open={showMoveTeamModal} onOpenChange={setShowMoveTeamModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MoveRight className="w-6 h-6 text-purple-600" />
              <span>Move Employee</span>
            </DialogTitle>
            <DialogDescription>
              Move {selectedEmployee?.firstName} {selectedEmployee?.lastName} to a different team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Current Team</div>
              <div className="font-medium text-gray-900">{selectedEmployee?.team}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">New Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a new team" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((team) => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowMoveTeamModal(false)} className="border-gray-200 bg-white/50 backdrop-blur-sm">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmMoveTeam}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Move Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;


