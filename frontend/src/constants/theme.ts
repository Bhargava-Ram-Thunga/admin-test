export const THEME = {
    colors: {
        primary: {
            teal: "#4D2B8C", // Tailwind Blue (Charts, Active) -> Mapped to primary
            navy: "#4D2B8C", // Deep Purple (Sidebar, Headings)
            indigo: "#3498db", // Light Blue (Neutral, Cards)
            pink: "#F39EB6", // Pastel Pink (Accents, Hover)
            bgGradient: "from-[#4D2B8C] to-[#4D2B8C]", // Solid primary now
            sidebarBg: "#4D2B8C", // Deep Purple
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
