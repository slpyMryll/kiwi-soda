"use client";

import { useState } from "react";
import { 
  Bell, 
  ShieldCheck, 
  Mail, 
  Smartphone, 
  Monitor, 
  Save, 
  Loader2,
  CheckCircle2,
  Briefcase,
  Eye,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateNotificationSettings } from "@/lib/actions/user";
import { toast } from "sonner";

interface NotificationSettings {
  email_alerts: boolean;
  push_alerts: boolean;
  in_app_alerts: boolean;
  budget_alerts?: boolean;
  overdue_task_alerts?: boolean;
  followed_project_updates?: boolean;
  weekly_digest?: boolean;
}

interface SettingsClientProps {
  role: "viewer" | "project-manager" | "admin";
  initialData: NotificationSettings;
}

const Toggle = ({ checked, onChange, disabled }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
  <button
    type="button"
    disabled={disabled}
    className={cn(
      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#153B44] focus:ring-offset-2",
      checked ? "bg-[#52B788]" : "bg-gray-200",
      disabled && "opacity-50 cursor-not-allowed"
    )}
    onClick={onChange}
  >
    <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
  </button>
);

export function SettingsClient({ role, initialData }: SettingsClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(initialData.email_alerts);
  const [pushAlerts, setPushAlerts] = useState(initialData.push_alerts);
  const [inAppAlerts, setInAppAlerts] = useState(initialData.in_app_alerts);
  
  // Role specific settings
  const [budgetAlerts, setBudgetAlerts] = useState(initialData.budget_alerts ?? true);
  const [overdueTaskAlerts, setOverdueTaskAlerts] = useState(initialData.overdue_task_alerts ?? true);
  const [followedProjectUpdates, setFollowedProjectUpdates] = useState(initialData.followed_project_updates ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(initialData.weekly_digest ?? true);

  const hasChanges = 
    emailAlerts !== initialData.email_alerts ||
    pushAlerts !== initialData.push_alerts ||
    inAppAlerts !== initialData.in_app_alerts ||
    (role === 'project-manager' && (
      budgetAlerts !== initialData.budget_alerts ||
      overdueTaskAlerts !== initialData.overdue_task_alerts
    )) ||
    (role === 'viewer' && (
      followedProjectUpdates !== initialData.followed_project_updates ||
      weeklyDigest !== initialData.weekly_digest
    ));

  const handleSaveSettings = async () => {
    if (!hasChanges) {
      toast.info("No changes to save.");
      return;
    }

    setIsSaving(true);
    
    const settings = {
      email_alerts: emailAlerts,
      push_alerts: pushAlerts,
      in_app_alerts: inAppAlerts,
      ...(role === 'project-manager' ? {
        budget_alerts: budgetAlerts,
        overdue_task_alerts: overdueTaskAlerts,
      } : {
        followed_project_updates: followedProjectUpdates,
        weekly_digest: weeklyDigest,
      })
    };

    toast.promise(updateNotificationSettings(settings), {
      loading: 'Saving preferences...',
      success: () => {
        setIsSaving(false);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        return 'Preferences saved successfully!';
      },
      error: (err) => {
        setIsSaving(false);
        return err?.message || 'Failed to save preferences.';
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#153B44] tracking-tight flex items-center gap-3">
            System Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your preferences, notifications, and account security.
          </p>
        </div>
        
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving || !hasChanges}
          className="bg-[#153B44] hover:bg-[#1B4B57] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-400 min-w-[140px]"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
           isSuccess ? <><CheckCircle2 className="w-4 h-4 text-[#52B788]" /> Saved!</> : 
           !hasChanges ? "No Changes" :
           <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Bell className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Notification Delivery</h2>
          </div>
          <div className="p-6 flex flex-col gap-6">
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100"><Mail className="w-5 h-5 text-gray-500" /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Email Notifications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Receive major updates directly to your registered VSU email.</p>
                </div>
              </div>
              <Toggle checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} disabled={isSaving} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100"><Smartphone className="w-5 h-5 text-gray-500" /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">OS Push Notifications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Receive native push alerts on your desktop or mobile device.</p>
                </div>
              </div>
              <Toggle checked={pushAlerts} onChange={() => setPushAlerts(!pushAlerts)} disabled={isSaving} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100"><Monitor className="w-5 h-5 text-gray-500" /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">In-App Notifications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Show alerts in the navigation bell while you are using the platform.</p>
                </div>
              </div>
              <Toggle checked={inAppAlerts} onChange={() => setInAppAlerts(!inAppAlerts)} disabled={isSaving} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            {role === 'project-manager' ? (
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
            ) : (
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Eye className="w-5 h-5" /></div>
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {role === 'project-manager' ? "Project Management Preferences" : "Viewer Preferences"}
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-6">
            
            {role === 'project-manager' ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Budget Approval Alerts</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Notify me immediately when a team member requests a budget expense.</p>
                  </div>
                  <Toggle checked={budgetAlerts} onChange={() => setBudgetAlerts(!budgetAlerts)} disabled={isSaving} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Overdue Task Warnings</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Send a daily summary of tasks that have missed their deadlines.</p>
                  </div>
                  <Toggle checked={overdueTaskAlerts} onChange={() => setOverdueTaskAlerts(!overdueTaskAlerts)} disabled={isSaving} />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Followed Project Updates</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Notify me when a project I follow adds an update.</p>
                  </div>
                  <Toggle checked={followedProjectUpdates} onChange={() => setFollowedProjectUpdates(!followedProjectUpdates)} disabled={isSaving} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Weekly Activity Digest</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Send a weekly summary of new USSC initiatives and completed projects.</p>
                  </div>
                  <Toggle checked={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} disabled={isSaving} />
                </div>
              </>
            )}

          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Data & Privacy</h2>
          </div>
          <div className="p-6">
            <div className="bg-[#E6F4EA] border border-[#52B788]/30 p-4 rounded-xl flex gap-4">
              <Info className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#1B4332] mb-1">Your data is secured.</h3>
                <p className="text-xs text-[#153B44]/80 leading-relaxed">
                  OnTrack employs enterprise-grade Row Level Security (RLS) to ensure your data is strictly siloed. 
                  Your personal information, passwords, and project activity are encrypted both in transit and at rest. 
                  We do not share your analytics or personal data with third-party advertisers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-4 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">OnTrack Platform</p>
          <p className="text-xs text-gray-400">Version 1.0.0 (Release build)</p>
          <p className="text-[10px] text-gray-400 mt-1">© {new Date().getFullYear()} Visayas State University Supreme Student Council</p>
        </div>

      </div>
    </div>
  );
}
