
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, fullWidth = false, ...props }) => {
    const widthClass = fullWidth ? 'w-full' : '';
    return (
        <button
            {...props}
            className={`
                ${widthClass}
                inline-flex items-center justify-center px-6 py-3
                border border-transparent text-base font-medium rounded-md shadow-sm text-white
                bg-cyan-600 hover:bg-cyan-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
                disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors
            `}
        >
            {children}
        </button>
    );
};
