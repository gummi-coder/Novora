import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FeatureGuard } from '@/components/common/FeatureGuard';
import { Plus, UserPlus, Settings, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export const TeamManagement: React.FC = () => {
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate fetching team members
    const mockMembers: TeamMember[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'active',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Member',
        status: 'active',
      },
    ];

    setTimeout(() => {
      setMembers(mockMembers);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <div>Loading team members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <FeatureGuard featureId="team-management" requiredTier="pro">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </FeatureGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search members..."
                className="max-w-sm"
              />
              <FeatureGuard featureId="team-management" requiredTier="pro">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Roles
                </Button>
              </FeatureGuard>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <FeatureGuard featureId="team-management" requiredTier="pro">
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </FeatureGuard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FeatureGuard featureId="team-management" requiredTier="enterprise">
        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Role Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create custom roles and assign specific permissions to team members.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Access Control</h3>
                <p className="text-sm text-muted-foreground">
                  Set up granular access controls for different team members and departments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FeatureGuard>
    </div>
  );
}; 