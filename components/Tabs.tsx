
import React, { useState } from 'react';

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

interface TabsProps {
  children: React.ReactElement<TabProps>[];
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ children, activeTab, setActiveTab }) => {
  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {children.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`${
                activeTab === index
                  ? 'border-green-400 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.props.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {children[activeTab]}
      </div>
    </div>
  );
};