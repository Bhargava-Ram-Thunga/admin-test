import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div
        className={`bg-white p-6 rounded-3xl shadow-lg shadow-[#393D7E]/5 border border-[#393D7E]/5 ${className}`}
    >
        {children}
    </div>
);
