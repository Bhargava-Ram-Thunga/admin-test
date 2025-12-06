

interface BadgeProps {
    type: "success" | "warning" | "danger" | "neutral" | string;
    text: string;
}

export const Badge = ({ type, text }: BadgeProps) => {
    const styles: { [key: string]: string } = {
        success: "bg-[#6DC3BB] text-white",
        warning: "bg-[#F2AEBB] text-[#C04C63]",
        danger: "bg-red-500 text-white",
        neutral: "bg-[#393D7E]/10 text-[#393D7E]",
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
