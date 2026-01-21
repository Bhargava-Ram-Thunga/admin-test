import { useState, useMemo } from "react";
import { Card } from "../components/ui/Card";
import type { User, HierarchyNode } from "../types";
import { HIERARCHY_LEVELS } from "../constants/theme";
import { MOCK_HIERARCHY, INITIAL_USERS } from "../data/mockData";
import { getDescendantsByType, getAdminLevelIndex } from "../utils/helpers";
import { Badge } from "../components/ui/Badge";
import { Trash2 } from "lucide-react";

interface SettingsViewProps {
  user: User;
}

export const SettingsView = ({ user }: SettingsViewProps) => {
  // Calculate admin level. If -1, they are super admin.
  // 0=State, 1=District, 2=Division, 3=Constituency, 4=Mandal
  const adminLevelIndex = useMemo(() => getAdminLevelIndex(user), [user]);

  // Filter available hierarchy levels for INVITATION:
  // Must be greater than or equal to adminLevelIndex (inclusive of own level)
  const availableLevels = useMemo(() => {
    return HIERARCHY_LEVELS.filter(
      (_, index) => index >= (adminLevelIndex ?? -1)
    );
  }, [adminLevelIndex]);

  // Filter hierarchy levels for ADMIN LIST FILTER:
  // Must be STRICTLY greater than adminLevelIndex (exclude own level)
  const filterLevels = useMemo(() => {
    return HIERARCHY_LEVELS.filter(
      (_, index) => index > (adminLevelIndex ?? -1)
    );
  }, [adminLevelIndex]);

  const [inviteLevel, setInviteLevel] = useState(availableLevels[0] || HIERARCHY_LEVELS[0]);
  const [inviteScope, setInviteScope] = useState("");

  const availableScopes = useMemo(() => {
    // Collect all nodes that match the selected inviteLevel
    let scopes: HierarchyNode[] = [];
    const searchRoot = MOCK_HIERARCHY as HierarchyNode[];
    searchRoot.forEach((root) => {
      // If root itself matches (e.g. State), add it
      if (root.type === inviteLevel) {
        scopes.push(root);
      }
      // Then add any descendants of that type
      scopes = [...scopes, ...getDescendantsByType(root, inviteLevel)];
    });
    return scopes;
  }, [inviteLevel]);

  // --- Admin List Logic ---
  const [admins, setAdmins] = useState(INITIAL_USERS);
  const [adminFilters, setAdminFilters] = useState({
    name: "",
    email: "",
    level: "",
    place: ""
  });

  // Calculate available Places based on selected Level filter
  const availableFilterPlaces = useMemo(() => {
    if (!adminFilters.level) return [];
    let places: HierarchyNode[] = [];
    // Search entire hierarchy for nodes of matching type
    const searchRoot = MOCK_HIERARCHY as HierarchyNode[];
    searchRoot.forEach(root => {
      if (root.type === adminFilters.level) places.push(root);
      places = [...places, ...getDescendantsByType(root, adminFilters.level)];
    });
    // Remove duplicates if any
    return Array.from(new Set(places.map(p => p.id)))
      .map(id => places.find(p => p.id === id)!);
  }, [adminFilters.level]);

  // Helper to get location name
  const getLocationName = (regionId: string) => {
    if (regionId === "ALL") return "All Regions";
    const findName = (nodes: HierarchyNode[]): string | undefined => {
      for (const node of nodes) {
        if (node.id === regionId) return node.name;
        if (node.children) {
          const found = findName(node.children);
          if (found) return found;
        }
      }
    };
    return findName(MOCK_HIERARCHY) || regionId;
  };

  // Determine level of an admin from their role string or implicit logic
  // For mock data, we can infer level from role name or regionId logic.
  // Using regionId is safer with getAdminLevelIndex helper logic, but for filtering we need the string.
  const getAdminLevel = (user: User) => {
    // Logic: map role name or check region node type.
    // Simplest: Check role string against HIERARCHY_LEVELS or use helper
    const lvlIndex = getAdminLevelIndex(user);
    if (lvlIndex === -1) return "Super Admin";
    return HIERARCHY_LEVELS[lvlIndex ?? 0]; // Default fallback
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      // 1. Must be strictly below current logged-in user
      const targetLevelIndex = getAdminLevelIndex(admin) ?? 99; // Default to low if unknown
      const currentLevelIndex = adminLevelIndex ?? -1;
      if (targetLevelIndex <= currentLevelIndex) return false; // Hide same or higher level
      if (admin.email === user.email) return false; // Double check self

      // 2. Name Filter
      if (adminFilters.name && !admin.name.toLowerCase().includes(adminFilters.name.toLowerCase())) return false;

      // 3. Email Filter
      if (adminFilters.email && !admin.email.toLowerCase().includes(adminFilters.email.toLowerCase())) return false;

      // 4. Level Filter
      const adminLevel = getAdminLevel(admin);
      if (adminFilters.level && adminLevel !== adminFilters.level) return false;

      // 5. Place Filter
      if (adminFilters.place && admin.regionId !== adminFilters.place) return false;

      return true;
    });
  }, [admins, adminFilters, adminLevelIndex, user]);

  const handleDeleteAdmin = (email: string) => {
    if (confirm(`Are you sure you want to permanently delete admin ${email}? This cannot be undone.`)) {
      setAdmins(prev => prev.filter(a => a.email !== email));
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#4D2B8C]">Settings</h1>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* BIG LEFT COLUMN: Main Admin Controls */}
        <div className="flex-1 space-y-6 w-full min-w-0">

          {/* Admin Access Control (Invite) */}
          <Card>
            <h3 className="font-bold text-lg text-[#4D2B8C] mb-6 border-b border-[#F5F7FA] pb-4">
              Admin Access Control
            </h3>
            <div className="bg-[#F5F7FA] p-6 rounded-2xl flex flex-col items-end gap-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-[#4D2B8C] uppercase ml-1">
                    Invitee Email
                  </label>
                  <input
                    placeholder="colleague@koding.com"
                    className="w-full mt-1 p-3 bg-white border border-[#4D2B8C]/10 rounded-xl outline-none"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-xs font-bold text-[#4D2B8C] uppercase ml-1">
                    Admin Level
                  </label>
                  <select
                    value={inviteLevel}
                    onChange={(e) => {
                      setInviteLevel(e.target.value);
                      setInviteScope(""); // Reset scope when level changes
                    }}
                    className="w-full mt-1 p-3 bg-white border border-[#4D2B8C]/10 rounded-xl outline-none text-[#4D2B8C]"
                  >
                    {availableLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-xs font-bold text-[#4D2B8C] uppercase ml-1">
                    Admin Scope
                  </label>
                  <select
                    value={inviteScope}
                    onChange={(e) => setInviteScope(e.target.value)}
                    className="w-full mt-1 p-3 bg-white border border-[#4D2B8C]/10 rounded-xl outline-none text-[#4D2B8C]"
                    disabled={availableScopes.length === 0}
                  >
                    <option value="">Select Scope...</option>
                    {availableScopes.map(scope => (
                      <option key={scope.id} value={scope.id}>{scope.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="w-full md:w-auto bg-[#4D2B8C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#F39EB6] transition shadow-lg">
                Send Invite
              </button>
            </div>
          </Card>

          {/* Managed Admins List */}
          <Card>
            <h3 className="font-bold text-lg text-[#4D2B8C] mb-6 border-b border-[#F5F7FA] pb-4">
              Managed Admins
            </h3>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <input
                  placeholder="Search Name..."
                  value={adminFilters.name}
                  onChange={(e) => setAdminFilters(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-[#4D2B8C]/10 rounded-xl text-sm outline-none focus:border-[#4D2B8C]/30 transition"
                />
              </div>
              <div>
                <input
                  placeholder="Search Email..."
                  value={adminFilters.email}
                  onChange={(e) => setAdminFilters(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-[#4D2B8C]/10 rounded-xl text-sm outline-none focus:border-[#4D2B8C]/30 transition"
                />
              </div>
              <div>
                <select
                  value={adminFilters.level}
                  onChange={(e) => setAdminFilters(prev => ({ ...prev, level: e.target.value, place: "" }))}
                  className="w-full p-2.5 bg-white border border-[#4D2B8C]/10 rounded-xl text-sm outline-none text-[#4D2B8C]"
                >
                  <option value="">All Levels</option>
                  {filterLevels.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={adminFilters.place}
                  onChange={(e) => setAdminFilters(prev => ({ ...prev, place: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-[#4D2B8C]/10 rounded-xl text-sm outline-none text-[#4D2B8C]"
                  disabled={!adminFilters.level}
                >
                  <option value="">All Places</option>
                  {availableFilterPlaces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Admins Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#4D2B8C] text-white">
                  <tr className="text-left text-xs font-bold uppercase">
                    <th className="p-4 pl-6 rounded-tl-xl">Admin Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Place</th>
                    <th className="p-4 rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F7FA]">
                  {filteredAdmins.length > 0 ? filteredAdmins.map(admin => (
                    <tr key={admin.email} className="hover:bg-[#F5F7FA] transition">
                      <td className="p-4 pl-6 text-sm font-bold text-[#4D2B8C]">{admin.name}</td>
                      <td className="p-4 text-sm text-[#4D2B8C]/80">{admin.email}</td>
                      <td className="p-4">
                        <Badge
                          type={getAdminLevel(admin) === "State" ? "success" : "neutral"}
                          text={getAdminLevel(admin)}
                        />
                      </td>
                      <td className="p-4 text-sm font-medium text-[#4D2B8C]">{getLocationName(admin.regionId)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteAdmin(admin.email)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Admin"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-gray-400">
                        No lower-level admins found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Profile Settings Panel */}
        <div className="w-full xl:w-96 shrink-0 order-first xl:order-last">
          <Card>
            <h3 className="font-bold text-lg text-[#4D2B8C] mb-6 border-b border-[#F5F7FA] pb-4">
              Profile Settings
            </h3>
            <div className="flex flex-col items-center gap-6">
              <img
                src={user.avatarUrl}
                className="w-32 h-32 rounded-full border-4 border-[#F5F7FA] shadow-sm"
              />
              <div className="space-y-4 w-full">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#4D2B8C] uppercase ml-1">
                      Full Name
                    </label>
                    <input
                      defaultValue={user.name}
                      className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#4D2B8C]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#4D2B8C] uppercase ml-1">
                      Email
                    </label>
                    <input
                      defaultValue={user.email}
                      className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#4D2B8C]"
                      disabled
                    />
                  </div>
                </div>
                <button className="w-full bg-[#4D2B8C] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#F39EB6] transition">
                  Save Changes
                </button>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
