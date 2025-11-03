
import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    isSticky?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, children, isSticky = false }) => {
    const stickyClass = isSticky ? 'sticky top-6' : '';
    return (
        <div className={`bg-gray-800 rounded-lg shadow-xl overflow-hidden ${stickyClass}`}>
            <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};
