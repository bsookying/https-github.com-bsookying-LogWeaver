
import React, { useState } from 'react';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    icon?: React.ReactNode;
    isOpen?: boolean;
    onToggle?: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false, icon, isOpen: controlledIsOpen, onToggle }) => {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const handleToggle = () => {
        if (isControlled) {
            onToggle?.();
        } else {
            setInternalIsOpen(prev => !prev);
        }
    };

    return (
        <div>
            <h2 id={`accordion-header-${title.replace(/\s+/g, '-')}`}>
                <button
                    type="button"
                    className={`flex items-center justify-between w-full p-2 px-3 text-sm font-normal text-left text-gray-300 bg-gray-900/70 border border-gray-700 rounded-md shadow-sm hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 ${isOpen ? 'rounded-b-none' : ''}`}
                    onClick={handleToggle}
                    aria-expanded={isOpen}
                    aria-controls={`accordion-body-${title.replace(/\s+/g, '-')}`}
                >
                    <span className="flex items-center gap-2 truncate">
                        {icon && <span className="flex-shrink-0">{icon}</span>}
                        <span className="truncate">{title}</span>
                    </span>
                    <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
            </h2>
            {isOpen && (
                <div id={`accordion-body-${title.replace(/\s+/g, '-')}`} className="p-4 bg-gray-900/70 border border-t-0 border-gray-700 rounded-b-md">
                    {children}
                </div>
            )}
        </div>
    );
};

interface AccordionProps {
    children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ children }) => {
    return <div className="space-y-2">{children}</div>;
};
