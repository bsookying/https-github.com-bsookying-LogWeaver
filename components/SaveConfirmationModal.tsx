import React from 'react';
import { PlayIcon, PencilIcon } from './icons';

interface SaveConfirmationModalProps {
    isOpen: boolean;
    onSimulate: () => void;
    onContinue: () => void;
    storyName: string;
}

export const SaveConfirmationModal: React.FC<SaveConfirmationModalProps> = ({ isOpen, onSimulate, onContinue, storyName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onContinue}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900 border border-green-700">
                         <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="mt-5 text-lg font-medium text-white">Story Saved!</h3>
                    <p className="mt-2 text-sm text-gray-400">
                        Your story "<span className="font-semibold text-gray-300">{storyName}</span>" has been saved. What would you like to do next?
                    </p>
                </div>
                <div className="bg-gray-900/50 px-4 py-4 sm:px-6 flex flex-row-reverse gap-3 rounded-b-lg">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 sm:w-auto sm:text-sm transition-colors"
                        onClick={onSimulate}
                    >
                        <PlayIcon className="w-5 h-5 mr-2" />
                        Simulate Now
                    </button>
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 sm:w-auto sm:text-sm transition-colors"
                        onClick={onContinue}
                    >
                        <PencilIcon className="w-5 h-5 mr-2" />
                        Continue Building
                    </button>
                </div>
            </div>
        </div>
    );
};
