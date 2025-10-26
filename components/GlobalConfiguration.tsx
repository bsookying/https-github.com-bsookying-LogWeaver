
import React, { useState, useEffect } from 'react';
import { SettingsIcon, SaveIcon, TrashIcon } from './icons';
import type { ToastMessage } from '../types';

interface GlobalConfigurationProps {
    xsiamUrl: string;
    setXsiamUrl: (url: string) => void;
    xsiamApiKey: string;
    setXsiamApiKey: (key: string) => void;
    addToast: (message: string, type: ToastMessage['type']) => void;
}

export const GlobalConfiguration: React.FC<GlobalConfigurationProps> = ({
    xsiamUrl, setXsiamUrl, xsiamApiKey, setXsiamApiKey, addToast
}) => {
    const [editedUrl, setEditedUrl] = useState(xsiamUrl);
    const [editedKey, setEditedKey] = useState(xsiamApiKey);

    useEffect(() => {
        setEditedUrl(xsiamUrl);
        setEditedKey(xsiamApiKey);
    }, [xsiamUrl, xsiamApiKey]);

    const handleSave = () => {
        setXsiamUrl(editedUrl);
        setXsiamApiKey(editedKey);
        if (editedUrl || editedKey) {
            addToast('Configuration saved successfully!', 'success');
        } else {
            addToast('Configuration cleared.', 'info');
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete the saved configuration? This action cannot be undone.')) {
            setXsiamUrl('');
            setXsiamApiKey('');
            addToast('Configuration deleted.', 'info');
        }
    };

    const hasSavedConfiguration = !!xsiamUrl || !!xsiamApiKey;
    const hasChanges = editedUrl !== xsiamUrl || editedKey !== xsiamApiKey;

    return (
        <div className="mt-6 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
                <SettingsIcon className="w-8 h-8 mr-3 text-green-400" />
                Global Configuration
            </h2>
            <p className="text-gray-400">
                These settings define secondary output targets for the generated logs. Enter your details and click 'Save'.
            </p>

            <div className="space-y-6 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-medium text-white">Log Destination (XDM over HTTP)</h3>
                 <div className="space-y-4">
                     <div>
                        <label htmlFor="xsiam-url" className="block text-sm font-medium text-gray-300 mb-1">XSIAM HTTP Collector URL</label>
                        <input 
                            type="text" 
                            id="xsiam-url" 
                            placeholder="https://api.your-instance.xsiam.paloaltonetworks.com/..." 
                            value={editedUrl} 
                            onChange={e => setEditedUrl(e.target.value)} 
                            className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="xsiam-api-key" className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                        <input 
                            type="password" 
                            id="xsiam-api-key" 
                            placeholder="Enter API Key"
                            value={editedKey} 
                            onChange={e => setEditedKey(e.target.value)}
                            className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                 </div>

                 <div className="flex justify-end items-center gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button onClick={handleDelete} disabled={!hasSavedConfiguration} className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed transition-colors">
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                    </button>
                    <button onClick={handleSave} disabled={!hasChanges} className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed transition-colors">
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Save
                    </button>
                 </div>
            </div>
        </div>
    );
};
