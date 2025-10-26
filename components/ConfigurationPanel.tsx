import React, { useState, useEffect, useRef } from 'react';
import type { Story } from '../types';
import { SettingsIcon } from './icons';

interface ConfigurationPanelProps {
    syslogIp: string;
    setSyslogIp: (ip: string) => void;
    selectedStoryId: string;
    setSelectedStoryId: (id: string) => void;
    stories: Story[];
    simulationState: 'running' | 'paused' | 'finished';
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
    syslogIp, setSyslogIp,
    selectedStoryId, setSelectedStoryId, stories, simulationState
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedStory = stories.find(s => s.id === selectedStoryId);
    const isDisabled = simulationState !== 'finished';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectStory = (storyId: string) => {
        setSelectedStoryId(storyId);
        setIsDropdownOpen(false);
    };


    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
                <SettingsIcon className="w-6 h-6 mr-2 text-green-400" />
                Configuration
            </h2>
            <div className="space-y-6 mt-6">
                <div>
                    <label htmlFor="syslog-ip" className="block text-sm font-medium text-gray-300">Enter Syslog Receiver IP</label>
                    <input
                        id="syslog-ip"
                        type="text"
                        value={syslogIp}
                        onChange={e => setSyslogIp(e.target.value)}
                        placeholder="e.g., 127.0.0.1"
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDisabled}
                    />
                </div>
                
                <div ref={dropdownRef}>
                    <label htmlFor="story-select-button" className="block text-sm font-medium text-gray-300">Choose a Story</label>
                    <button
                        id="story-select-button"
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="mt-1 relative w-full cursor-pointer rounded-md bg-gray-700 border border-gray-600 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-haspopup="listbox"
                        aria-expanded={isDropdownOpen}
                        disabled={isDisabled}
                    >
                        <span className="block truncate text-white">{selectedStory?.name || 'Select a story...'}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </button>

                    {isDropdownOpen && !isDisabled && (
                        <div className="mt-1 w-full rounded-md bg-gray-700 shadow-lg border border-gray-600 max-h-60 overflow-auto focus:outline-none sm:text-sm z-10">
                            <ul role="listbox" aria-labelledby="story-select-button">
                                <li
                                    onClick={() => handleSelectStory('')}
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-400 hover:bg-green-700 hover:text-white"
                                    role="option"
                                    aria-selected={!selectedStoryId}
                                >
                                    Select a story...
                                </li>
                                {stories.map(story => (
                                    <li
                                        key={story.id}
                                        onClick={() => handleSelectStory(story.id)}
                                        className={`cursor-pointer select-none relative py-2 pl-3 pr-9 text-white hover:bg-green-600 ${selectedStoryId === story.id ? 'bg-green-800' : ''}`}
                                        role="option"
                                        aria-selected={selectedStoryId === story.id}
                                    >
                                        <span className={`block truncate ${selectedStoryId === story.id ? 'font-semibold' : 'font-normal'}`}>
                                            {story.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};