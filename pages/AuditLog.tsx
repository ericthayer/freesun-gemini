import React, { useState, useEffect } from 'react';
import {
  Activity, Calendar, User, Shield, FileText, Filter, Download,
  RefreshCw, Search, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useIsSuperAdmin } from '../lib/PermissionContext';
import { supabase } from '../lib/supabaseClient';
import { Navigate } from 'react-router-dom';

interface AdminAction {
  id: string;
  admin_user_id: string | null;
  admin_crew_member_id: string | null;
  action_type: string;
  target_user_id: string | null;
  target_crew_member_id: string | null;
  target_resource: string | null;
  target_resource_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_name?: string;
  target_name?: string;
}

const AuditLog: React.FC = () => {
  const isSuperAdmin = useIsSuperAdmin();
  const { crewProfile } = useAuth();
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [filteredActions, setFilteredActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchAuditLog();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [actions, searchTerm, actionTypeFilter, dateFilter]);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const { data: actionsData, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      const crewIds = new Set<string>();
      actionsData.forEach((action: AdminAction) => {
        if (action.admin_crew_member_id) crewIds.add(action.admin_crew_member_id);
        if (action.target_crew_member_id) crewIds.add(action.target_crew_member_id);
      });

      const { data: crewData } = await supabase
        .from('crew_members')
        .select('id, name')
        .in('id', Array.from(crewIds));

      const crewMap = new Map(crewData?.map(c => [c.id, c.name]) || []);

      const enrichedActions = actionsData.map((action: AdminAction) => ({
        ...action,
        admin_name: action.admin_crew_member_id ? crewMap.get(action.admin_crew_member_id) : 'System',
        target_name: action.target_crew_member_id ? crewMap.get(action.target_crew_member_id) : 'Unknown'
      }));

      setActions(enrichedActions);
    } catch (error) {
      console.error('Error fetching audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...actions];

    if (actionTypeFilter !== 'all') {
      filtered = filtered.filter(a => a.action_type === actionTypeFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(a => new Date(a.created_at) >= startDate);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.admin_name?.toLowerCase().includes(term) ||
        a.target_name?.toLowerCase().includes(term) ||
        a.action_type.toLowerCase().includes(term) ||
        a.target_resource?.toLowerCase().includes(term)
      );
    }

    setFilteredActions(filtered);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'assign_super_admin':
      case 'revoke_super_admin':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'assign_role':
      case 'revoke_role':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'delete_user':
        return <User className="w-5 h-5 text-red-500" />;
      case 'restore_user':
        return <User className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'assign_super_admin':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'revoke_super_admin':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'assign_role':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'revoke_role':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delete_user':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'restore_user':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  const getActionLabel = (actionType: string) => {
    return actionType.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportAuditLog = () => {
    const csv = [
      ['Timestamp', 'Admin', 'Action', 'Target User', 'Resource', 'IP Address'].join(','),
      ...filteredActions.map(a => [
        new Date(a.created_at).toISOString(),
        a.admin_name || 'System',
        a.action_type,
        a.target_name || 'N/A',
        a.target_resource || 'N/A',
        a.ip_address || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueActionTypes = Array.from(new Set(actions.map(a => a.action_type)));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Audit Log</h1>
              <p className="text-muted-foreground">Track all administrative actions and changes</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportAuditLog}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={fetchAuditLog}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by admin, user, action, or resource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={actionTypeFilter}
                  onChange={(e) => setActionTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Actions</option>
                  {uniqueActionTypes.map(type => (
                    <option key={type} value={type}>{getActionLabel(type)}</option>
                  ))}
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                  className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {filteredActions.length} of {actions.length} actions</span>
              <span>Last 500 actions</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActions.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                No audit log entries found matching your criteria
              </div>
            ) : (
              filteredActions.map((action) => (
                <div
                  key={action.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getActionIcon(action.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(action.action_type)}`}>
                            {getActionLabel(action.action_type)}
                          </span>
                          <span className="text-sm text-muted-foreground">{formatDate(action.created_at)}</span>
                        </div>
                        <p className="text-sm mb-1">
                          <span className="font-medium">{action.admin_name}</span>
                          {' performed '}
                          <span className="font-medium">{getActionLabel(action.action_type).toLowerCase()}</span>
                          {action.target_name && (
                            <>
                              {' for '}
                              <span className="font-medium">{action.target_name}</span>
                            </>
                          )}
                        </p>
                        {action.target_resource && (
                          <p className="text-sm text-muted-foreground">
                            Resource: {action.target_resource}
                          </p>
                        )}
                      </div>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        {expandedAction === action.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedAction === action.id && (
                    <div className="border-t border-border p-4 bg-muted/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {action.before_data && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Before
                            </h4>
                            <pre className="text-xs bg-background p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(action.before_data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {action.after_data && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              After
                            </h4>
                            <pre className="text-xs bg-background p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(action.after_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Admin ID</p>
                          <p className="text-sm font-mono">{action.admin_crew_member_id || 'System'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                          <p className="text-sm font-mono">{action.ip_address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                          <p className="text-sm">{new Date(action.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {action.user_agent && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                          <p className="text-xs font-mono text-muted-foreground">{action.user_agent}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
