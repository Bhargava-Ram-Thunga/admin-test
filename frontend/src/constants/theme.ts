export const THEME = {
    colors: {
        primary: {
            purple: "#5E35B1", // Kodingcaravan accent (active nav, chart highlight)
            teal: "#4D2B8C",
            navy: "#4D2B8C",
            indigo: "#3498db",
            pink: "#F39EB6",
            bgGradient: "from-[#5E35B1] to-[#4D2B8C]",
            sidebarBg: "#ffffff",
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
