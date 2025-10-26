import React from 'react';
import type { Detection, StoryStage } from '../types';
import { ClipboardListIcon } from './icons';

interface VendorSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    stage: (StoryStage & { index: number }) | null;
    availableDetections: Detection[];
    onSelect: (stageIndex: number, detectionId: string) => void;
}

export const VendorSelectionModal: React.FC<VendorSelectionModalProps> = ({
    isOpen, onClose, stage, availableDetections, onSelect
}) => {
    if (!isOpen || !stage) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <ClipboardListIcon className="w-6 h-6 mr-3 text-green-400" />
                        Select Log Source for: <span className="ml-2 text-green-400">{stage.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6">
                    <p className="text-gray-300 mb-4">
                        Choose which product's log format to simulate for this stage of the attack.
                    </p>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {availableDetections.length > 0 ? (
                            availableDetections.map(detection => (
                                <button
                                    key={detection.id}
                                    onClick={() => {
                                        onSelect(stage.index, detection.id);
                                        onClose();
                                    }}
                                    className="w-full text-left p-4 bg-gray-700 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <p className="font-semibold text-white">{detection.productType} - {detection.dataSource}</p>
                                    <p className="text-sm text-gray-300 mt-1">{detection.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{detection.tactic} - {detection.mitre_technique}</p>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No available detections for this technique and domain.</p>
                        )}
                    </div>
                </div>
                 <div className="p-4 border-t border-gray-700 text-right">
                    <button onClick={onClose} className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
