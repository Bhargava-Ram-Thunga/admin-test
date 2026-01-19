

interface BadgeProps {
    type: "success" | "warning" | "danger" | "neutral" | string;
    text: string;
}

export const Badge = ({ type, text }: BadgeProps) => {
    const styles: { [key: string]: string } = {
        success: "bg-[#4D2B8C] text-white",
        warning: "bg-[#F39EB6]/20 text-[#4D2B8C]",
        danger: "bg-red-500 text-white",
        neutral: "bg-[#4D2B8C]/10 text-[#4D2B8C]",
    };
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${styles[type] || styles.neutral
                }`}
        >
            {text}
        </span>
    );
};
