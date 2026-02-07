/** Settings: Profile editable (full name). PATCH /api/v1/admin/auth/me. */
import { useState } from "react";
import { Card } from "../components/ui/Card";
import type { User } from "../types";
import { patchData, ADMIN_API } from "../api/client";
import { setSession } from "../utils/auth";
import { primaryRoleDisplayName } from "../constants/roles";

interface SettingsViewProps {
  user: User;
  addToast?: (message: string, type: "success" | "error" | "warning") => void;
}

export const SettingsView = ({ user, addToast }: SettingsViewProps) => {
  const [fullName, setFullName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const admin = await patchData<{
        id: string;
        email: string;
        fullName: string | null;
        roles?: { code: string; name?: string }[];
        permissions?: string[];
        adminType?: string;
        state?: string | null;
        district?: string | null;
        zone?: string | null;
        locality?: string | null;
      }>(`${ADMIN_API}/auth/me`, { fullName: fullName.trim() || null });
      const roleCodes = admin.roles?.map((r) => r.code) ?? [];
      const updated: User = {
        ...user,
        id: admin.id,
        name: admin.fullName ?? admin.email,
        role: primaryRoleDisplayName(roleCodes),
        roles: admin.roles,
        permissions: admin.permissions,
        adminType: admin.adminType as User["adminType"],
        state: admin.state ?? undefined,
        district: admin.district ?? undefined,
        zone: admin.zone ?? undefined,
        locality: admin.locality ?? undefined,
      };
      setSession(updated);
      window.dispatchEvent(new CustomEvent("admin-profile-updated"));
      addToast?.("Profile updated.", "success");
    } catch {
      addToast?.("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#4D2B8C]">Settings</h1>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full min-w-0">
          <Card>
            <h3 className="font-bold text-lg text-[#4D2B8C] mb-6 border-b border-[#F5F7FA] pb-4">
              Profile Settings
            </h3>
            <div className="flex flex-col items-center gap-6">
              <img
                src={user.avatarUrl}
                alt=""
                className="w-32 h-32 rounded-full border-4 border-[#F5F7FA] shadow-sm"
              />
              <div className="space-y-4 w-full">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#4D2B8C] uppercase ml-1">
                      Full Name
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#4D2B8C]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#4D2B8C] uppercase ml-1">
                      Email
                    </label>
                    <input
                      value={user.email}
                      className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#4D2B8C]"
                      disabled
                    />
                  </div>
                  {user.roles?.length ? (
                    <div>
                      <label className="text-xs font-bold text-[#4D2B8C] uppercase ml-1">
                        Role(s)
                      </label>
                      <p className="mt-1 p-3 bg-[#F5F7FA] rounded-xl text-[#4D2B8C] font-medium">
                        {user.roles.map((r) => r.name ?? r.code).join(", ")}
                      </p>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#4D2B8C] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#F39EB6] transition disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
