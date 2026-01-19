import { useState, useMemo } from "react";
import { Plus, Filter, Lock, Layers, MapPin, ChevronDown } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { CustomSelect } from "../components/ui/CustomSelect";
import { HIERARCHY_LEVELS } from "../constants/theme";
import { MOCK_HIERARCHY, MOCK_TRAINERS } from "../data/mockData";
import {
  getAdminLevelIndex,
  getDescendantsByType,
  getDescendantIds,
} from "../utils/helpers";
import type { Student, Trainer, User, HierarchyNode } from "../types";

interface RegionsViewProps {
  user: User;
  students: Student[];
  trainers?: Trainer[]; // Optional to match usage in App.tsx but ignored internally
}

export const RegionsView = ({ user, students }: RegionsViewProps) => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [viewMode, setViewMode] = useState("students");

  // Calculate admin level. If -1, they are super admin.
  // 0=State, 1=District, 2=Division, 3=Constituency, 4=Mandal
  const adminLevelIndex = useMemo(() => getAdminLevelIndex(user), [user]);

  // Filter available hierarchy levels:
  // Must be strictly greater than adminLevelIndex (Children Only)
  const availableLevels = useMemo(() => {
    return HIERARCHY_LEVELS.filter(
      (_, index) => index > (adminLevelIndex ?? -1)
    );
  }, [adminLevelIndex]);

  // Handle case where no children exist (e.g. Mandal Admin)
  const isLeafNodeAdmin =
    availableLevels.length === 0 && user.regionId !== "ALL";

  // Get regions based on selected type AND strict descendant scope
  const availableLocations = useMemo(() => {
    if (!selectedType) return [];

    // Find the admin's node first
    const findNode = (
      nodes: HierarchyNode[],
      id: string
    ): HierarchyNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const f = findNode(n.children, id);
          if (f) return f;
        }
      }
      return null;
    };

    let searchRoot = MOCK_HIERARCHY as HierarchyNode[];
    if (user.regionId !== "ALL") {
      const adminNode = findNode(MOCK_HIERARCHY, user.regionId);
      // We only search within the adminNode's children
      searchRoot = adminNode ? [adminNode] : [];
    }

    // Now find all nodes of 'selectedType' within this scope
    // But we must NOT include the admin node itself if it matches the type (which shouldn't happen due to level filtering, but good for safety)
    let locations: HierarchyNode[] = [];
    searchRoot.forEach((root) => {
      locations = [...locations, ...getDescendantsByType(root, selectedType)];
    });

    // Remove the admin's own node if it accidentally got included
    return locations.filter((loc) => loc.id !== user.regionId);
  }, [selectedType, user]);

  const locationDataIds = useMemo(() => {
    if (!selectedLocationId) return [];
    const findNode = (
      nodes: HierarchyNode[],
      id: string
    ): HierarchyNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const f = findNode(n.children, id);
          if (f) return f;
        }
      }
      return null;
    };
    const node = findNode(MOCK_HIERARCHY, selectedLocationId);
    return node ? getDescendantIds(node) : [];
  }, [selectedLocationId]);

  const filteredStudents = useMemo(
    () =>
      !selectedLocationId
        ? []
        : students.filter((s) => locationDataIds.includes(s.regionId)),
    [locationDataIds, students]
  );
  const filteredTeachers = useMemo(
    () =>
      !selectedLocationId
        ? []
        : MOCK_TRAINERS.filter((t) => locationDataIds.includes(t.regionId)),
    [locationDataIds]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#4D2B8C]">
          Regional Data Explorer
        </h1>
        {user.regionId === "ALL" && (
          <button className="bg-[#4D2B8C] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#F39EB6] transition shadow-lg shadow-[#4D2B8C]/20">
            <Plus size={16} className="inline mr-1" /> Add Region
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-[#4D2B8C]/5 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* DROPDOWN 1: HIERARCHY LEVEL */}
          <CustomSelect
            label="Hierarchy Level"
            value={selectedType}
            onChange={(val) => {
              setSelectedType(val);
              setSelectedLocationId("");
            }}
            options={availableLevels}
            icon={Layers}
            disabled={isLeafNodeAdmin}
            placeholder={isLeafNodeAdmin ? "No Child Levels" : "Select Level"}
          />

          {/* DROPDOWN 2: REGION NAME */}
          <div className="flex flex-col gap-1 w-full min-w-[200px]">
            <label
              className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${!selectedType ? "text-gray-300" : "text-[#4D2B8C]/50"
                }`}
            >
              Location
            </label>
            <div className="relative group">
              <MapPin
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${!selectedType ? "text-gray-300" : "text-[#4D2B8C]/40"
                  }`}
              />
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className={`w-full pl-9 pr-8 py-2.5 bg-white border rounded-xl text-xs font-bold outline-none appearance-none transition-all
                            ${!selectedType
                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                    : "border-[#4D2B8C]/10 text-[#4D2B8C] hover:bg-[#F5F7FA] focus:ring-2 focus:ring-[#F39EB6] cursor-pointer"
                  }`}
                disabled={!selectedType || availableLocations.length === 0}
              >
                <option value="">
                  {availableLocations.length === 0 && selectedType
                    ? "No regions found"
                    : `Select ${selectedType || "Region"}...`}
                </option>
                {availableLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${!selectedType ? "text-gray-300" : "text-[#4D2B8C]/40"
                  }`}
              />
            </div>
          </div>
        </div>

        <div className="flex bg-[#F5F7FA] p-1 rounded-xl">
          <button
            onClick={() => setViewMode("students")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "students"
              ? "bg-[#4D2B8C] text-white shadow-md"
              : "text-[#4D2B8C] hover:text-[#4D2B8C]/80"
              }`}
          >
            Students ({filteredStudents.length})
          </button>
          <button
            onClick={() => setViewMode("teachers")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "teachers"
              ? "bg-[#4D2B8C] text-white shadow-md"
              : "text-[#4D2B8C] hover:text-[#4D2B8C]/80"
              }`}
          >
            Teachers ({filteredTeachers.length})
          </button>
        </div>
      </div>

      {/* EMPTY STATES & MESSAGES */}
      {isLeafNodeAdmin ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-red-50 rounded-3xl border-2 border-red-100 border-dashed">
          <div className="p-4 bg-white rounded-full mb-4 text-[#4D2B8C] shadow-sm">
            <Lock size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#4D2B8C]">
            Restricted Access
          </h3>
          <p className="text-[#F39EB6] font-medium max-w-sm mt-2">
            You are logged in as a <strong>{user.role}</strong>. There are no
            lower-level regions available for you to view or filter.
          </p>
        </div>
      ) : !selectedLocationId ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-white/50 rounded-3xl border-2 border-[#4D2B8C]/10 border-dashed">
          <div className="p-4 bg-[#E0E7FF] rounded-full mb-4 text-[#4D2B8C]">
            <Filter size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#4D2B8C]">
            Select a Location
          </h3>
          <p className="text-[#4D2B8C]">
            Choose a hierarchy level and location to view data.
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-0 overflow-hidden shadow-xl border-none">
            {viewMode === "students" ? (
              <table className="w-full">
                <thead className="bg-[#4D2B8C] text-white">
                  <tr className="text-left text-xs font-bold uppercase">
                    <th className="p-4 pl-6">Student Name</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Enrollment</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F7FA]">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F5F7FA]">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <img src={s.avatarUrl} className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-[#4D2B8C] text-sm">
                          {s.name}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#4D2B8C]">{s.course}</td>
                      <td className="p-4 text-sm text-[#4D2B8C]/70">
                        {s.enrollmentDate}
                      </td>
                      <td className="p-4">
                        <Badge
                          type={s.status === "Active" ? "success" : "neutral"}
                          text={s.status}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-sm text-slate-400"
                      >
                        No students found in this region.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-[#4D2B8C] text-white">
                  <tr className="text-left text-xs font-bold uppercase">
                    <th className="p-4 pl-6">Trainer Name</th>
                    <th className="p-4">Students</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F7FA]">
                  {filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F5F7FA]">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <img src={t.avatarUrl} className="w-8 h-8 rounded-lg" />
                        <div>
                          <p className="font-bold text-[#4D2B8C] text-sm">
                            {t.name}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-[#4D2B8C]">
                        {t.students}
                      </td>
                      <td className="p-4 text-sm text-[#F39EB6] font-bold">
                        ★ {t.rating}
                      </td>
                      <td className="p-4">
                        <Badge
                          type={t.status === "Active" ? "success" : "warning"}
                          text={t.status}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-sm text-slate-400"
                      >
                        No trainers found in this region.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
