export const THEME = {
    colors: {
        primary: {
            purple: "#6D5DFB", // Primary Brand
            green: "#22C55E",  // Success
            orange: "#F59E0B", // Warning
            red: "#EF4444",    // Error
            cyan: "#06B6D4",   // Secondary/Info
        },
        background: {
            app: "#F9FAFB",
            surface: "#FFFFFF",
            sidebar: "#FFFFFF",
            sidebarActive: "#F3F4FF",
        },
        text: {
            heading: "#111827",
            body: "#4B5563",
            muted: "#9CA3AF",
            sidebarIdle: "#9CA3AF",
            sidebarActive: "#6D5DFB",
        }
    },
};

export const CHART_COLORS = [
    THEME.colors.primary.purple,
    THEME.colors.primary.green,
    THEME.colors.primary.orange,
    THEME.colors.primary.red,
    THEME.colors.primary.cyan,
];

export const HIERARCHY_LEVELS = [
    "State",
    "District",
    "Division",
    "Constituency",
    "Mandal",
];
