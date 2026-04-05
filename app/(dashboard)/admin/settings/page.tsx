"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  MapPin,
  Facebook,
  Instagram,
  Shield,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { getSystemSettings, updateSystemSetting } from "@/lib/actions/system";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [showGeneralSuccess, setShowGeneralSuccess] = useState(false);

  const [isSavingLegal, setIsSavingLegal] = useState(false);
  const [showLegalSuccess, setShowLegalSuccess] = useState(false);

  useEffect(() => {
    getSystemSettings().then((data) => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const handleSaveGeneral = async () => {
    setIsSavingGeneral(true);
    setShowGeneralSuccess(false);

    await Promise.all([
      updateSystemSetting("org_name", settings.org_name || ""),
      updateSystemSetting("office_location", settings.office_location || ""),
      updateSystemSetting("contact_email", settings.contact_email || ""),
      updateSystemSetting("social_fb", settings.social_fb || ""),
      updateSystemSetting("social_ig", settings.social_ig || ""),
    ]);

    setIsSavingGeneral(false);
    setShowGeneralSuccess(true);
    setTimeout(() => setShowGeneralSuccess(false), 3000);
  };

  const handleSaveLegal = async () => {
    setIsSavingLegal(true);
    setShowLegalSuccess(false);

    await Promise.all([
      updateSystemSetting("legal_privacy", settings.legal_privacy || ""),
      updateSystemSetting("legal_terms", settings.legal_terms || ""),
      updateSystemSetting("legal_cookies", settings.legal_cookies || ""),
    ]);

    setIsSavingLegal(false);
    setShowLegalSuccess(true);
    setTimeout(() => setShowLegalSuccess(false), 3000);
  };

  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4332]" />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#153B44] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#1B4332]" /> Platform Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure global platform data, contact details, and legal documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              General Information
            </h2>
            <button
              onClick={handleSaveGeneral}
              disabled={isSavingGeneral}
              className="flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-900 transition-colors disabled:opacity-70 shadow-sm"
            >
              {isSavingGeneral ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save General
            </button>
          </div>

          {showGeneralSuccess && (
            <div className="bg-green-50 text-green-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-4 h-4" /> General settings updated
              successfully!
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Office Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Organization Name
                </label>
                <input
                  value={settings.org_name || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, org_name: e.target.value })
                  }
                  className="w-full text-sm font-medium border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#1B4332] outline-none bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Office Location
                </label>
                <input
                  value={settings.office_location || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      office_location: e.target.value,
                    })
                  }
                  className="w-full text-sm font-medium border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#1B4332] outline-none bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Contact Email
                </label>
                <input
                  value={settings.contact_email || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, contact_email: e.target.value })
                  }
                  className="w-full text-sm font-medium border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#1B4332] outline-none bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <Facebook className="w-4 h-4" /> Social Links
            </h3>
            <div className="space-y-4">
              <div className="relative flex items-center">
                <div className="absolute left-3 text-blue-600">
                  <Facebook className="w-5 h-5" />
                </div>
                <input
                  value={settings.social_fb || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, social_fb: e.target.value })
                  }
                  placeholder="Facebook URL"
                  className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-600 outline-none bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-pink-600">
                  <Instagram className="w-5 h-5" />
                </div>
                <input
                  value={settings.social_ig || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, social_ig: e.target.value })
                  }
                  placeholder="Instagram URL"
                  className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:border-pink-600 outline-none bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Legal & Compliance
            </h2>
            <button
              onClick={handleSaveLegal}
              disabled={isSavingLegal}
              className="flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-900 transition-colors disabled:opacity-70 shadow-sm"
            >
              {isSavingLegal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Legal
            </button>
          </div>

          {showLegalSuccess && (
            <div className="bg-green-50 text-green-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-4 h-4" /> Legal documents updated
              successfully!
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 flex-1 flex flex-col">
            <p className="text-xs text-gray-500 mb-2">
              Updates to these documents reflect instantly on the public legal
              pages.
            </p>

            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col min-h-[160px]">
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Privacy Policy
                </label>
                <textarea
                  value={settings.legal_privacy || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, legal_privacy: e.target.value })
                  }
                  className="w-full flex-1 min-h-[120px] text-sm border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1B4332] outline-none bg-gray-50 focus:bg-white transition-colors resize-y"
                  placeholder="Enter privacy policy text..."
                />
              </div>

              <div className="flex-1 flex flex-col min-h-[160px]">
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Terms & Conditions
                </label>
                <textarea
                  value={settings.legal_terms || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, legal_terms: e.target.value })
                  }
                  className="w-full flex-1 min-h-[120px] text-sm border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1B4332] outline-none bg-gray-50 focus:bg-white transition-colors resize-y"
                  placeholder="Enter terms and conditions text..."
                />
              </div>

              <div className="flex-1 flex flex-col min-h-[160px]">
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Cookie Policy
                </label>
                <textarea
                  value={settings.legal_cookies || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, legal_cookies: e.target.value })
                  }
                  className="w-full flex-1 min-h-[120px] text-sm border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1B4332] outline-none bg-gray-50 focus:bg-white transition-colors resize-y"
                  placeholder="Enter cookie policy text..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
