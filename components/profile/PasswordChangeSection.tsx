import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const PasswordChangeSection: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const passwordTooShort = newPassword.length > 0 && newPassword.length < 6;
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password.' });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
        <Lock size={12} /> Change Password
      </label>

      {message && (
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl animate-in fade-in duration-200 ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {message.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          {message.text}
        </div>
      )}

      <div className="space-y-3 bg-muted/30 border dark:border-primary/20 p-4 rounded-xl">
        <div className="space-y-1.5">
          <label htmlFor="current-password" className="text-[11px] font-semibold text-muted-foreground">
            Current Password
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-background border dark:border-primary/30 rounded-lg px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-[11px] font-semibold text-muted-foreground">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-background border dark:border-primary/30 rounded-lg px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showNew ? 'Hide new password' : 'Show new password'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordTooShort && (
            <p className="text-[10px] text-destructive">Must be at least 6 characters.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-[11px] font-semibold text-muted-foreground">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full bg-background border dark:border-primary/30 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          {mismatch && (
            <p className="text-[10px] text-destructive">Passwords do not match.</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={loading || !newPassword || !confirmPassword || passwordTooShort || mismatch}
          className="w-full py-2.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
};
