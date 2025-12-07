export const THEME = {
    colors: {
        primary: {
            teal: "#3b82f6", // Tailwind Blue (Charts, Active)
            navy: "#6366f1", // Tailwind Indigo (Sidebar, Headings)
            indigo: "#3498db", // Light Blue (Neutral, Cards)
            pink: "#8b5cf6", // Tailwind Purple (Accents)
            bgGradient: "from-[#F0F7FF] to-[#F0F7FF]", // Very Soft Blue (Background)
            sidebarBg: "#6366f1", // Tailwind Indigo
        },
    },
};

export const CHART_COLORS = [
    THEME.colors.primary.navy,
    THEME.colors.primary.teal,
    "#3498db", // Light Blue
    THEME.colors.primary.pink,
    "#A0AEC0",
];

export const HIERARCHY_LEVELS = [
    "State",
    "District",
    "Division",
    "Constituency",
    "Mandal",
];
