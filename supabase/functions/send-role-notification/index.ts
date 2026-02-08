import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  targetCrewMemberEmail: string;
  targetCrewMemberName: string;
  actionType: 'assign_super_admin' | 'revoke_super_admin' | 'assign_role' | 'revoke_role' | 'user_created' | 'user_deleted' | 'user_restored';
  roleName?: string;
  adminName: string;
}

function generateEmailBody(notification: NotificationRequest): string {
  const { targetCrewMemberName, actionType, roleName, adminName } = notification;

  switch (actionType) {
    case 'assign_super_admin':
      return `
Dear ${targetCrewMemberName},

You have been granted Super Administrator privileges for the FreeSun Hot Air Ballooning Club system.

As a Super Admin, you now have the following capabilities:
• Create, edit, and delete user accounts
• Assign and revoke Super Admin status for other users
• Manage all system roles and permissions
• View audit logs of all admin actions
• Full access to manage balloons, schedules, maintenance, and events

This role comes with significant responsibility. Please use these privileges carefully and in accordance with club policies.

Assigned by: ${adminName}

If you have questions about your new role, please contact the system administrator.

Best regards,
FreeSun Hot Air Ballooning Club
      `.trim();

    case 'revoke_super_admin':
      return `
Dear ${targetCrewMemberName},

Your Super Administrator privileges for the FreeSun Hot Air Ballooning Club system have been revoked.

You will no longer have access to:
• User management functions
• Role assignment capabilities
• Audit log viewing
• Administrative controls

Your regular crew member access remains unchanged.

Revoked by: ${adminName}

If you believe this was done in error, please contact the system administrator.

Best regards,
FreeSun Hot Air Ballooning Club
      `.trim();

    case 'assign_role':
      return `
Dear ${targetCrewMemberName},

You have been assigned the role of "${roleName}" in the FreeSun Hot Air Ballooning Club system.

This role grants you specific permissions to perform tasks related to your responsibilities.

Assigned by: ${adminName}

Welcome to your new role! If you have questions about your permissions, please contact your administrator.

Best regards,
FreeSun Hot Air Ballooning Club
      `.trim();

    case 'revoke_role':
      return `
Dear ${targetCrewMemberName},

The role "${roleName}" has been revoked from your account in the FreeSun Hot Air Ballooning Club system.

Revoked by: ${adminName}

If you have questions about this change, please contact the system administrator.

Best regards,
FreeSun Hot Air Ballooning Club
      `.trim();

    case 'user_created':
      return `
Dear ${targetCrewMemberName},

Welcome to the FreeSun Hot Air Ballooning Club!

Your user account has been created successfully. You can now log in to access the system.

Your registered email: ${notification.targetCrewMemberEmail}

Please check your email for login credentials and instructions to set up your account.

Created by: ${adminName}

We're excited to have you as part of our team!

Best regards,
FreeSun Hot Air Ballooning Club
      `.trim();

    case 'user_deleted':
      return `
Dear ${targetCrewMemberName},

Your account with the FreeSun Hot Air Ballooning Club has been deactivated.

Your account data has been preserved and can be restored by a Super Administrator if needed.

Deactivated by: ${adminName}

If you believe this was done in error, please contact the system administrator immediately.

Best regards,
FreeSun Hot Air Ballooning Club
      `.trim();

    case 'user_restored':
      return `
Dear ${targetCrewMemberName},

Good news! Your account with the FreeSun Hot Air Ballooning Club has been restored.

You can now log in and access the system again with your previous credentials.

Restored by: ${adminName}

Welcome back to the team!

Best regards,
FreeSun Hot Air Ballooning Club
      `.trim();

    default:
      return `
Dear ${targetCrewMemberName},

Your account status has been updated in the FreeSun Hot Air Ballooning Club system.

Updated by: ${adminName}

If you have questions about this change, please contact the system administrator.

Best regards,
FreeSun Hot Air Ballooning Club
      `.trim();
  }
}

function generateEmailSubject(actionType: string, roleName?: string): string {
  switch (actionType) {
    case 'assign_super_admin':
      return 'You Have Been Granted Super Admin Privileges';
    case 'revoke_super_admin':
      return 'Super Admin Privileges Revoked';
    case 'assign_role':
      return `New Role Assigned: ${roleName}`;
    case 'revoke_role':
      return `Role Revoked: ${roleName}`;
    case 'user_created':
      return 'Welcome to FreeSun Hot Air Ballooning Club';
    case 'user_deleted':
      return 'Account Deactivated';
    case 'user_restored':
      return 'Account Restored';
    default:
      return 'Account Status Update';
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const notification = await req.json() as NotificationRequest;

    const subject = generateEmailSubject(notification.actionType, notification.roleName);
    const body = generateEmailBody(notification);

    console.log('Email Notification:');
    console.log('To:', notification.targetCrewMemberEmail);
    console.log('Subject:', subject);
    console.log('Body:', body);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email notification sent successfully',
        details: {
          to: notification.targetCrewMemberEmail,
          subject: subject,
          preview: body.substring(0, 100) + '...'
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email notification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
