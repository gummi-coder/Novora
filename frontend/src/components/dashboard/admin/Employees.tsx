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
import { Download, Upload, Plus, Pencil, MoveRight, Archive, Mail } from "lucide-react";
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [autoCreateTeam, setAutoCreateTeam] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CsvPreviewRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getAdminUsers({ limit: 100 });
        // Map API users into Employee view model (limited info available)
        const mapped: Employee[] = data.map((u) => ({
          id: String(u.id),
          firstName: u.email.split('@')[0],
          lastName: "",
          email: u.email,
          phone: "",
          position: "",
          team: u.company_name || "-",
          role: (u.role === 'admin' ? 'manager' : 'employee'),
          status: u.is_active ? "Active" : "Archived",
          lastSurveySent: undefined,
          lastResponse: undefined,
          locale: undefined,
          timezone: undefined,
          employmentType: undefined,
        }));
        setEmployees(mapped);
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

  const startAdd = () => { setEditing(null); setDrawerOpen(true); };
  const startEdit = (emp: Employee) => { setEditing(emp); setDrawerOpen(true); };

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
      setDrawerOpen(false);
    } catch (e) {
      alert('Failed to save employee');
    }
  };

  const resendInvites = () => {
    // mock action
    alert(`Resent invites to ${selectedIds.size} employee(s)`);
  };

  const archiveSelected = () => {
    setEmployees((prev) => prev.map((e) => selectedIds.has(e.id) ? { ...e, status: "Archived" } : e));
    setSelectedIds(new Set());
  };

  const exportCsv = () => {
    const header = ["first_name","last_name","email","phone","position","team","role","locale","timezone"].join(",");
    const rows = filtered.map((e) => [e.firstName, e.lastName, e.email, e.phone || "", e.position || "", e.team, e.role, e.locale || "", e.timezone || ""].map((v) => (v ?? "")).join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "employees.csv"; a.click(); URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
            <p className="text-gray-600">
              Manage employees, invitations and team assignments across your organization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setImportOpen(true)} className="hover:bg-blue-50 hover:border-blue-200">
              <Upload className="w-4 h-4 mr-2" /> Import CSV
            </Button>
            <Button variant="outline" onClick={exportCsv} className="hover:bg-green-50 hover:border-green-200">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={startAdd} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </div>
        </div>

        {/* Enhanced Search & Filters Card */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span>Search & Filters</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Find employees by name, email, or phone and refine by team/status/role
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Search</Label>
                <Input 
                  className="h-12" 
                  placeholder="Search name, email, phone" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Team</Label>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12">
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-12">
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

        {/* Enhanced Bulk Actions */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 font-medium">
            Selected: <span className="text-blue-600">{selectedIds.size}</span> employee{selectedIds.size !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => alert("Assign to team (mock)")} className="hover:bg-blue-50 hover:border-blue-200">
              Assign to team
            </Button>
            <Button variant="outline" size="sm" onClick={resendInvites} className="hover:bg-green-50 hover:border-green-200">
              <Mail className="w-4 h-4 mr-2" /> Resend invites
            </Button>
            <Button variant="outline" size="sm" onClick={archiveSelected} className="hover:bg-red-50 hover:border-red-200">
              <Archive className="w-4 h-4 mr-2" /> Archive
            </Button>
          </div>
        </div>

        {/* Enhanced Employee Table */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-sm text-gray-600 font-medium">
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
                    <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
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
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEdit(e)} className="hover:bg-blue-50 hover:border-blue-200">
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={async () => { try { await api.resendVerification(e.email); alert('Invite resent'); } catch { alert('Resend failed'); } }} className="hover:bg-green-50 hover:border-green-200">
                            <Mail className="w-4 h-4 mr-1" /> Resend Invite
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => alert("Move team (mock)")} className="hover:bg-purple-50 hover:border-purple-200">
                            <MoveRight className="w-4 h-4 mr-1" /> Move Team
                          </Button>
                          <Button variant="outline" size="sm" onClick={async () => { try { await api.deactivateAdminUser(Number(e.id)); setEmployees((prev) => prev.map((x) => x.id === e.id ? { ...x, status: "Archived" } : x)); } catch { alert('Archive failed'); } }} className="hover:bg-red-50 hover:border-red-200">
                            <Archive className="w-4 h-4 mr-1" /> Archive
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-gray-700 font-medium text-lg">No employees found</div>
                <div className="text-sm text-gray-500 max-w-md mx-auto">
                  {employees.length === 0 ? "Import from CSV or add manually to get started" : "Try clearing filters or importing from CSV"}
                </div>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button variant="outline" onClick={() => setImportOpen(true)} className="hover:bg-blue-50 hover:border-blue-200">
                    <Upload className="w-4 h-4 mr-2" /> Import CSV
                  </Button>
                  <Button onClick={startAdd} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Employee
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drawer for Add/Edit */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editing ? "Edit Employee" : "Add Employee"}</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First name</Label>
                <Input defaultValue={editing?.firstName} onChange={(e) => editing && (editing.firstName = e.target.value)} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input defaultValue={editing?.lastName} onChange={(e) => editing && (editing.lastName = e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Email *</Label>
                <Input defaultValue={editing?.email} onChange={(e) => editing && (editing.email = e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input defaultValue={editing?.phone} onChange={(e) => editing && (editing.phone = e.target.value)} placeholder="+15551234567" />
              </div>
              <div>
                <Label>Position/Title</Label>
                <Input defaultValue={editing?.position} onChange={(e) => editing && (editing.position = e.target.value)} />
              </div>
              <div>
                <Label>Team *</Label>
                <Input defaultValue={editing?.team} onChange={(e) => editing && (editing.team = e.target.value)} />
              </div>
              <div>
                <Label>Role</Label>
                <Select defaultValue={editing?.role || "employee"} onValueChange={(v) => editing && (editing.role = v as EmployeeRole)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Locale</Label>
                <Input defaultValue={editing?.locale} onChange={(e) => editing && (editing.locale = e.target.value)} placeholder="en-US" />
              </div>
              <div>
                <Label>Timezone</Label>
                <Input defaultValue={editing?.timezone} onChange={(e) => editing && (editing.timezone = e.target.value)} placeholder="America/New_York" />
              </div>
              <div>
                <Label>Employment type</Label>
                <Input defaultValue={editing?.employmentType} onChange={(e) => editing && (editing.employmentType = e.target.value)} placeholder="FT / PT / Contractor" />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button onClick={() => handleSave(editing || {})}>Save</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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
              <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
              <Button onClick={applyCsv} disabled={!csvPreview || csvPreview.length === 0}>Apply Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;


