

interface BadgeProps {
    type: "success" | "warning" | "danger" | "neutral" | string;
    text: string;
}

export const Badge = ({ type, text }: BadgeProps) => {
    const styles: { [key: string]: string } = {
        success: "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20",
        warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20",
        danger: "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20",
        neutral: "bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--text-muted)]/20",
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
