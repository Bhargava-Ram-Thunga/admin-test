import { MOCK_HIERARCHY } from "../data/mockData";
import { HIERARCHY_LEVELS } from "../constants/theme";
import type {
  HierarchyNode,
  User,
  ChartConfig,
  ChartDataPoint,
} from "../types";

export const getDescendantIds = (node: HierarchyNode): string[] => {
  let ids = [node.id];
  if (node.children) {
    node.children.forEach((child) => {
      ids = [...ids, ...getDescendantIds(child)];
    });
  }
  return ids;
};

// Gets all descendants of a specific TYPE from a given starting node
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


export const getScopeIds = (user: User): string[] => {
  if (user.regionId === "ALL") return ["ALL"];
  const findNode = (
    nodes: HierarchyNode[],
    id: string
  ): HierarchyNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const rootNode = findNode(MOCK_HIERARCHY, user.regionId);
  return rootNode ? getDescendantIds(rootNode) : [];
};

export const checkPermission = (user: User, itemRegionId: string): boolean => {
  if (user.regionId === "ALL") return true;
  const allowedIds = getScopeIds(user);
  return allowedIds.includes(itemRegionId);
};

// Returns the index of the level (0=State, 4=Mandal)
export const getLevelIndex = (type: string): number =>
  HIERARCHY_LEVELS.indexOf(type);

// Determines the user's hierarchy level index based on their assigned node
export const getAdminLevelIndex = (user: User): number | null => {
  if (user.regionId === "ALL") return -1; // Super Admin (above State)

  const findNodeLevel = (nodes: HierarchyNode[], id: string): number | null => {
    for (const node of nodes) {
      if (node.id === id) return getLevelIndex(node.type);
      if (node.children) {
        const found = findNodeLevel(node.children, id);
        if (found !== null) return found;
      }
    }
    return null;
  };
  return findNodeLevel(MOCK_HIERARCHY, user.regionId);
};

// Generates fake analytics based on config
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
    // Dynamic labels based on region type would be ideal, but mock data for now
    if (regionType === "State") labels = ["Telangana", "Andhra Pradesh"];
    else if (regionType === "District")
      labels = ["Hyderabad", "Warangal", "Ranga Reddy"];
    else labels = ["Zone A", "Zone B", "Zone C", "Zone D"];
  }
  return labels.map((label) => {
    let value = 0;
    switch (metric) {
      case "students":
        value = Math.floor(Math.random() * 5000) + 1000;
        break;
      case "revenue":
        value = Math.floor(Math.random() * 1000000) + 50000;
        break;
      case "teachers":
        value = Math.floor(Math.random() * 200) + 20;
        break;
      case "attendance":
        value = Math.floor(Math.random() * 30) + 70;
        break;
      case "growth":
        value = Math.floor(Math.random() * 100) - 20;
        break;
      default:
        value = Math.floor(Math.random() * 1000);
    }
    return { name: label, value };
  });
};

