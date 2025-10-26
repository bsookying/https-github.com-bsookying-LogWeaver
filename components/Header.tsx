import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center text-glow uppercase tracking-wider">
                LogWeaver
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                The Security Syslog Story Simulator
            </p>
        </header>
    );
};