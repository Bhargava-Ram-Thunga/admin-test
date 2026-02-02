import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div
        className={`bg-white rounded-2xl p-5 border border-gray-200 ${className}`}
    >
        {children}
    </div>
);
