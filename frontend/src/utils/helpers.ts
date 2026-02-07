import { HIERARCHY_LEVELS } from "../constants/theme";
import type {
  HierarchyNode,
  User,
  ChartConfig,
  ChartDataPoint,
} from "../types";

/** Max student allocations (4–8) from rating; matches backend allocation.service getTrainerMaxAllocationCount */
export function getMaxCapacityFromRating(rating: number | null): number {
  const r = rating ?? 0;
  if (r >= 4.6) return 8;
  if (r >= 4.1) return 7;
  if (r >= 3.6) return 6;
  if (r >= 3.1) return 5;
  return 4; // 2.1–3.0 or no rating
}

export const getDescendantIds = (node: HierarchyNode): string[] => {
  let ids = [node.id];
  if (node.children) {
    node.children.forEach((child) => {
      ids = [...ids, ...getDescendantIds(child)];
    });
  }
  return ids;
};

export const getDescendantsByType = (
  node: HierarchyNode,
  targetType: string
): HierarchyNode[] => {
  let results: HierarchyNode[] = [];
  if (node.type === targetType) {
    results.push(node);
  }
  if (node.children) {
    node.children.forEach((child) => {
      results = [...results, ...getDescendantsByType(child, targetType)];
    });
  }
  return results;
};

/** Scope IDs from backend user location (state, district, zone, locality). */
export const getScopeIds = (user: User): string[] => {
  if (user.regionId === "ALL") return ["ALL"];
  const ids: string[] = [];
  if (user.state) ids.push(user.state);
  if (user.district) ids.push(user.district);
  if (user.zone) ids.push(user.zone);
  if (user.locality) ids.push(user.locality);
  return ids.length ? ids : [user.regionId];
};

/**
 * Check if user can access an item by scope/region (backend location fields).
 * Note: This is a scope/region check (itemRegionId), not a permission-code check.
 * For permission codes (e.g. operations:manage_classes), use hasPermission from constants/permissions.
 */
export const checkPermission = (user: User, itemRegionId: string): boolean => {
  if (user.regionId === "ALL") return true;
  const allowedIds = getScopeIds(user);
  return allowedIds.includes(itemRegionId);
};

export const getLevelIndex = (type: string): number =>
  HIERARCHY_LEVELS.indexOf(type);

/** Admin level from backend location: state=0, district=1, zone=2, locality=3, ALL=-1. */
export const getAdminLevelIndex = (user: User): number | null => {
  if (user.regionId === "ALL") return -1;
  if (user.locality) return 3;
  if (user.zone) return 2;
  if (user.district) return 1;
  if (user.state) return 0;
  return null;
};

/** Generate placeholder chart data (backend can replace with real analytics). */
export const generateAnalyticsData = (
  config: ChartConfig
): ChartDataPoint[] => {
  const { xAxisMode, timeGranularity, regionType, metric } = config;
  let labels: string[] = [];
  if (xAxisMode === "time") {
    if (timeGranularity === "daily")
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    else if (timeGranularity === "weekly")
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    else if (timeGranularity === "monthly")
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    else labels = ["2022", "2023", "2024", "2025"];
  } else {
    if (regionType === "State") labels = ["State A", "State B"];
    else if (regionType === "District")
      labels = ["District A", "District B", "District C"];
    else labels = ["Zone A", "Zone B", "Zone C"];
  }
  return labels.map((label) => {
    let value = 0;
    switch (metric) {
      case "students":
        value = Math.floor(Math.random() * 500) + 100;
        break;
      case "revenue":
        value = Math.floor(Math.random() * 100000) + 5000;
        break;
      case "teachers":
        value = Math.floor(Math.random() * 50) + 10;
        break;
      case "attendance":
        value = Math.floor(Math.random() * 30) + 70;
        break;
      case "growth":
        value = Math.floor(Math.random() * 100) - 20;
        break;
      default:
        value = Math.floor(Math.random() * 100);
    }
    return { name: label, value };
  });
};
