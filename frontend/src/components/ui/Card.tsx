import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div
        className={`bg-white rounded-2xl p-6 shadow-sm border border-[#3498db]/20 ${className}`}
    >
        {children}
    </div>
);
