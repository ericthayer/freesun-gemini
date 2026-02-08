import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Plus, Edit2, Trash2, Shield, ShieldCheck,
  RefreshCw, Download, MoreVertical, Clock, CheckCircle, XCircle,
  UserCheck, UserX, RotateCcw, Activity, Mail, RefreshCcw, Key
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useIsSuperAdmin } from '../lib/PermissionContext';
import { supabase } from '../lib/supabaseClient';
import { Navigate } from 'react-router-dom';

interface CrewMember {
  id: string;
  name: string;
  email: string;
  role: 'Pilot' | 'Ground Crew';
  is_super_admin: boolean;
  availability: 'available' | 'busy';
  experience_years: number;
  flights: number;
  specialty: string;
  bio: string;
  image_url: string;
  phone: string;
  certifications: string[];
  user_id: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  deletedUsers: number;
  superAdmins: number;
  pilots: number;
  groundCrew: number;
}

const UserManagement: React.FC = () => {
  const isSuperAdmin = useIsSuperAdmin();
  const { crewProfile } = useAuth();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('active');
  const [adminFilter, setAdminFilter] = useState<'all' | 'admin' | 'regular'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'created_at' | 'experience_years'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<CrewMember | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showBatchSyncModal, setShowBatchSyncModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    deletedUsers: 0,
    superAdmins: 0,
    pilots: 0,
    groundCrew: 0
  });

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchCrewMembers();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [crewMembers, searchTerm, roleFilter, statusFilter, adminFilter, sortBy, sortOrder]);

  const fetchCrewMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const members = data as CrewMember[];
      setCrewMembers(members);

      const activeMembers = members.filter(m => !m.deleted_at);
      const deletedMembers = members.filter(m => m.deleted_at);

      setStats({
        totalUsers: members.length,
        activeUsers: activeMembers.length,
        deletedUsers: deletedMembers.length,
        superAdmins: activeMembers.filter(m => m.is_super_admin).length,
        pilots: activeMembers.filter(m => m.role === 'Pilot').length,
        groundCrew: activeMembers.filter(m => m.role === 'Ground Crew').length,
      });
    } catch (error) {
      console.error('Error fetching crew members:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...crewMembers];

    if (statusFilter === 'active') {
      filtered = filtered.filter(m => !m.deleted_at);
    } else if (statusFilter === 'deleted') {
      filtered = filtered.filter(m => m.deleted_at);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }

    if (adminFilter === 'admin') {
      filtered = filtered.filter(m => m.is_super_admin);
    } else if (adminFilter === 'regular') {
      filtered = filtered.filter(m => !m.is_super_admin);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.specialty.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'experience_years':
          comparison = a.experience_years - b.experience_years;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredMembers(filtered);
  };

  const handleDeleteUser = async (user: CrewMember) => {
    if (!crewProfile) return;

    try {
      const { error } = await supabase
        .from('crew_members')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: crewProfile.id
        })
        .eq('id', user.id);

      if (error) throw error;

      await supabase.from('admin_actions').insert({
        admin_crew_member_id: crewProfile.id,
        action_type: 'delete_user',
        target_crew_member_id: user.id,
        target_resource: 'crew_members',
        target_resource_id: user.id,
        before_data: { name: user.name, email: user.email, deleted_at: null },
        after_data: { name: user.name, email: user.email, deleted_at: new Date().toISOString() }
      });

      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (token) {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-role-notification`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetCrewMemberEmail: user.email,
              targetCrewMemberName: user.name,
              actionType: 'user_deleted',
              adminName: crewProfile.name
            })
          }
        );
      }

      await fetchCrewMembers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleRestoreUser = async (user: CrewMember) => {
    if (!crewProfile) return;

    try {
      const { error } = await supabase
        .from('crew_members')
        .update({
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', user.id);

      if (error) throw error;

      await supabase.from('admin_actions').insert({
        admin_crew_member_id: crewProfile.id,
        action_type: 'restore_user',
        target_crew_member_id: user.id,
        target_resource: 'crew_members',
        target_resource_id: user.id,
        before_data: { name: user.name, email: user.email, deleted_at: user.deleted_at },
        after_data: { name: user.name, email: user.email, deleted_at: null }
      });

      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (token) {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-role-notification`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetCrewMemberEmail: user.email,
              targetCrewMemberName: user.name,
              actionType: 'user_restored',
              adminName: crewProfile.name
            })
          }
        );
      }

      await fetchCrewMembers();
      setShowRestoreModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error restoring user:', error);
      alert('Failed to restore user');
    }
  };

  const handleToggleSuperAdmin = async (user: CrewMember) => {
    if (!crewProfile) return;

    if (user.id === crewProfile.id && user.is_super_admin) {
      alert('You cannot remove your own Super Admin status');
      return;
    }

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-role`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'assign',
            targetCrewMemberId: user.id,
            isSuperAdmin: !user.is_super_admin
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update Super Admin status');
      }

      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-role-notification`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetCrewMemberEmail: user.email,
            targetCrewMemberName: user.name,
            actionType: user.is_super_admin ? 'revoke_super_admin' : 'assign_super_admin',
            adminName: crewProfile.name
          })
        }
      );

      await fetchCrewMembers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error toggling Super Admin:', error);
      alert(error instanceof Error ? error.message : 'Failed to update Super Admin status');
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Is Super Admin', 'Experience Years', 'Flights', 'Specialty', 'Status'].join(','),
      ...filteredMembers.map(m => [
        m.name,
        m.email,
        m.role,
        m.is_super_admin ? 'Yes' : 'No',
        m.experience_years,
        m.flights,
        m.specialty,
        m.deleted_at ? 'Deleted' : 'Active'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncEmail = async (user: CrewMember) => {
    if (!user.user_id) {
      alert('User does not have an auth account');
      return;
    }

    try {
      setSyncProgress('Syncing email...');
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-crew-emails`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            crewMemberId: user.id
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync email');
      }

      alert(`Email synced successfully for ${user.name}`);
      await fetchCrewMembers();
      setShowSyncModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error syncing email:', error);
      alert(error instanceof Error ? error.message : 'Failed to sync email');
    } finally {
      setSyncProgress('');
    }
  };

  const handleBatchSync = async (dryRun: boolean = false) => {
    try {
      setSyncProgress(dryRun ? 'Running dry run...' : 'Syncing all users...');
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-crew-emails`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            batchUpdate: true,
            dryRun
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync emails');
      }

      const message = `${dryRun ? 'Dry Run Complete' : 'Sync Complete'}\n\n` +
        `Total: ${result.summary.total}\n` +
        `Updated: ${result.summary.updated}\n` +
        `Already Synced: ${result.summary.alreadySynced}\n` +
        `Failed: ${result.summary.failed}`;

      alert(message);

      if (!dryRun) {
        await fetchCrewMembers();
      }

      setShowBatchSyncModal(false);
    } catch (error) {
      console.error('Error in batch sync:', error);
      alert(error instanceof Error ? error.message : 'Failed to batch sync');
    } finally {
      setSyncProgress('');
    }
  };

  const handlePasswordReset = async (user: CrewMember, sendEmail: boolean) => {
    if (!user.user_id) {
      alert('User does not have an auth account');
      return;
    }

    try {
      setSyncProgress('Processing password reset...');
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-crew-passwords`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            crewMemberId: user.id,
            sendResetEmail: sendEmail
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      alert(result.message);
      setShowPasswordResetModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setSyncProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">User Management</h1>
              <p className="text-muted-foreground">Manage crew members and Super Admin roles</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBatchSyncModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Batch Sync Emails
              </button>
              <button
                onClick={exportUsers}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={fetchCrewMembers}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Deleted</span>
              </div>
              <p className="text-2xl font-bold">{stats.deletedUsers}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Super Admins</span>
              </div>
              <p className="text-2xl font-bold">{stats.superAdmins}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Pilots</span>
              </div>
              <p className="text-2xl font-bold">{stats.pilots}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <UserCheck className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Ground Crew</span>
              </div>
              <p className="text-2xl font-bold">{stats.groundCrew}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'deleted')}
                  className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="deleted">Deleted</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Roles</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Ground Crew">Ground Crew</option>
                </select>
                <select
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value as 'all' | 'admin' | 'regular')}
                  className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Users</option>
                  <option value="admin">Super Admins</option>
                  <option value="regular">Regular Users</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as typeof sortBy);
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="role-asc">Role (A-Z)</option>
                  <option value="role-desc">Role (Z-A)</option>
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="experience_years-desc">Most Experience</option>
                  <option value="experience_years-asc">Least Experience</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Experience</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Flights</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Permissions</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        No users found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.image_url || 'https://via.placeholder.com/40'}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {member.name}
                                {member.is_super_admin && (
                                  <ShieldCheck className="w-4 h-4 text-yellow-500" title="Super Admin" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.role === 'Pilot'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{member.experience_years} years</td>
                        <td className="px-6 py-4 text-sm">{member.flights}</td>
                        <td className="px-6 py-4">
                          {member.deleted_at ? (
                            <span className="flex items-center gap-2 text-red-500 text-sm">
                              <XCircle className="w-4 h-4" />
                              Deleted
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-green-500 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {member.is_super_admin ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                              <Shield className="w-3 h-3" />
                              Super Admin
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Regular User</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {!member.deleted_at ? (
                              <>
                                {member.user_id && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedUser(member);
                                        setShowSyncModal(true);
                                      }}
                                      className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
                                      title="Sync Auth Email"
                                    >
                                      <Mail className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedUser(member);
                                        setShowPasswordResetModal(true);
                                      }}
                                      className="p-2 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-colors"
                                      title="Reset Password"
                                    >
                                      <Key className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedUser(member);
                                    setShowRoleModal(true);
                                  }}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                                  title="Manage Permissions"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(member);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUser(member);
                                  setShowRestoreModal(true);
                                }}
                                className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
                                title="Restore User"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 text-red-500 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete User</h3>
                <p className="text-sm text-muted-foreground">This action can be reversed</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>?
              Their account will be deactivated but can be restored later by a Super Admin.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {showRestoreModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/20 text-green-500 rounded-full">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Restore User</h3>
                <p className="text-sm text-muted-foreground">Reactivate this account</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to restore <strong>{selectedUser.name}</strong>?
              They will regain full access to their account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestoreUser(selectedUser)}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Restore User
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-full">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Manage Permissions</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                Current Status: {selectedUser.is_super_admin ? (
                  <span className="font-semibold text-yellow-400">Super Admin</span>
                ) : (
                  <span className="font-semibold text-foreground">Regular User</span>
                )}
              </p>
              <p className="text-muted-foreground mb-4">
                {selectedUser.is_super_admin
                  ? 'Removing Super Admin status will revoke all administrative privileges.'
                  : 'Granting Super Admin status will allow this user to manage all users and system settings.'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleSuperAdmin(selectedUser)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  selectedUser.is_super_admin
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                {selectedUser.is_super_admin ? 'Revoke' : 'Grant'} Super Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {showSyncModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-500 rounded-full">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Sync Auth Email</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                This will update the auth.users email to match the crew_members email.
              </p>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Crew Member Email:</p>
                <p className="text-sm text-primary">{selectedUser.email}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                The user may be logged out temporarily and will need to use this email for future logins.
              </p>
            </div>
            {syncProgress && (
              <div className="mb-4 p-3 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                {syncProgress}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSyncModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                disabled={!!syncProgress}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSyncEmail(selectedUser)}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                disabled={!!syncProgress}
              >
                Sync Email
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-500 rounded-full">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Batch Sync All Emails</h3>
                <p className="text-sm text-muted-foreground">Sync all user emails with auth</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                This will update all auth.users emails to match their crew_members emails.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg mb-4">
                <p className="text-sm text-yellow-400 font-medium">⚠️ Important</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Users may be logged out temporarily. Run a dry run first to see what changes will be made.
                </p>
              </div>
            </div>
            {syncProgress && (
              <div className="mb-4 p-3 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                {syncProgress}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBatchSyncModal(false)}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                disabled={!!syncProgress}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBatchSync(true)}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                disabled={!!syncProgress}
              >
                Dry Run
              </button>
              <button
                onClick={() => handleBatchSync(false)}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                disabled={!!syncProgress}
              >
                Sync All
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 text-purple-500 rounded-full">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Reset Password</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                Choose how to reset this user's password:
              </p>
              <div className="space-y-3">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Send Reset Email</p>
                  <p className="text-xs text-muted-foreground">
                    User will receive an email at {selectedUser.email} with a password reset link.
                  </p>
                </div>
              </div>
            </div>
            {syncProgress && (
              <div className="mb-4 p-3 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                {syncProgress}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                disabled={!!syncProgress}
              >
                Cancel
              </button>
              <button
                onClick={() => handlePasswordReset(selectedUser, true)}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                disabled={!!syncProgress}
              >
                Send Reset Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
