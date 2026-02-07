import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  role?: string;
  tabIndex?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const Card = ({ children, className = "", role, tabIndex, onClick, onKeyDown, ...rest }: CardProps) => (
    <div
        className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 ${className}`}
        role={role}
        tabIndex={tabIndex}
        onClick={onClick}
        onKeyDown={onKeyDown}
        {...rest}
    >
        {children}
    </div>
);
