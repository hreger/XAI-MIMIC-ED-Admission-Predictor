
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 mt-auto">
            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} AI Healthcare Systems. All rights reserved.</p>
                <p>This is a demonstration tool. Not for clinical use.</p>
            </div>
        </footer>
    );
};
