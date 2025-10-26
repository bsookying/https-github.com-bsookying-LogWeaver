

import React, { useState, useMemo, useEffect } from 'react';
import type { Story, StoryStage, Detection } from '../types';
import { DETECTIONS_LIBRARY, DETECTIONS_BY_ID } from '../constants';
import { InfoIcon, ListBulletIcon } from './icons';
import { VendorSelectionModal } from './VendorSelectionModal';
import { Accordion, AccordionItem } from './Accordion';

interface StoryBriefingPanelProps {
    selectedStory: Story | undefined;
    stageDetectionChoices: Record<number, string>;
    setStageDetectionChoices: (choices: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
    simulationState: 'running' | 'paused' | 'finished';
}

export const StoryBriefingPanel: React.FC<StoryBriefingPanelProps> = ({
    selectedStory,
    stageDetectionChoices,
    setStageDetectionChoices,
    simulationState
}) => {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        stage: (StoryStage & { index: number; }) | null;
        availableDetections: Detection[];
    }>({ isOpen: false, stage: null, availableDetections: [] });
    
    const [openSections, setOpenSections] = useState({ description: false, alertSequence: false });

    const handleToggleSection = (section: 'description' | 'alertSequence') => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        if (simulationState === 'running') {
            setOpenSections({
                description: false,
                alertSequence: false,
            });
        }
    }, [simulationState]);

    useEffect(() => {
        // When a new story is selected, ensure the sections are closed by default.
        setOpenSections({ description: false, alertSequence: false });
    }, [selectedStory?.id]);

    const alertSequence = useMemo(() => {
        if (!selectedStory?.stages) return [];
        return selectedStory.stages.map((stage, index) => {
            const chosenDetectionId = stageDetectionChoices[index];
            let detection: Detection | undefined;

            if (chosenDetectionId) {
                detection = DETECTIONS_BY_ID[chosenDetectionId];
            } else {
                const possibleDetections = DETECTIONS_LIBRARY.filter(d => 
                    d.mitre_technique.startsWith(stage.techniqueId) && d.domain === stage.domain
                ).sort((a, b) => a.productType.localeCompare(b.productType)); // Sort for consistent default
                detection = possibleDetections[0];
            }
            
            return {
                stageName: stage.name,
                domain: stage.domain,
                detectionName: detection ? detection.name : `No detection available for ${stage.techniqueId}`,
                product: detection ? detection.productType : 'N/A'
            };
        });
    }, [selectedStory, stageDetectionChoices]);

    const handleStageClick = (stage: StoryStage, index: number) => {
        if (!selectedStory?.stages) return;
        const availableDetections = DETECTIONS_LIBRARY.filter(d => 
            d.mitre_technique.startsWith(stage.techniqueId) && d.domain === stage.domain
        ).sort((a,b) => a.productType.localeCompare(b.productType));

        setModalState({ isOpen: true, stage: { ...stage, index }, availableDetections });
    };

    const handleSelectDetection = (stageIndex: number, detectionId: string) => {
        setStageDetectionChoices(prev => ({ ...prev, [stageIndex]: detectionId }));
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, stage: null, availableDetections: [] });
    };

    if (!selectedStory) {
        return (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
                <p className="text-gray-500">Select a story to view its briefing.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold text-white">{selectedStory.name}</h2>
                
                <Accordion>
                    {selectedStory.description && (
                        <AccordionItem 
                            title="Description" 
                            icon={<InfoIcon className="w-5 h-5 text-gray-400" />}
                            isOpen={openSections.description}
                            onToggle={() => handleToggleSection('description')}
                        >
                            <p className="text-sm text-gray-400">{selectedStory.description}</p>
                        </AccordionItem>
                    )}
                    <AccordionItem
                        title="Alert Sequence"
                        icon={<ListBulletIcon className="w-5 h-5 text-gray-400" />}
                        isOpen={openSections.alertSequence}
                        onToggle={() => handleToggleSection('alertSequence')}
                    >
                         <ol className="relative border-l border-gray-600 ml-2 space-y-4">
                            {alertSequence.map((alert, index) => (
                                <li key={index} className="ml-6">
                                    <span className="absolute flex items-center justify-center w-6 h-6 bg-green-900/50 text-green-300 border-2 border-green-700 rounded-full -left-3 ring-8 ring-gray-800">
                                        {index + 1}
                                    </span>
                                    <button 
                                        onClick={() => selectedStory.stages && handleStageClick(selectedStory.stages[index], index)}
                                        className="w-full text-left p-3 bg-gray-700/60 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                                        aria-label={`Select log source for ${alert.stageName}`}
                                    >
                                        <h4 className="font-semibold text-gray-200">{alert.stageName}</h4>
                                        <p className="text-sm text-green-400 mt-1">{alert.detectionName}</p>
                                        <p className="text-xs text-gray-400 mt-1">{alert.domain} <span className="text-gray-500 mx-1">•</span> {alert.product}</p>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </AccordionItem>
                </Accordion>
            </div>
            {modalState.stage && (
                 <VendorSelectionModal 
                    isOpen={modalState.isOpen}
                    onClose={handleCloseModal}
                    stage={modalState.stage}
                    availableDetections={modalState.availableDetections}
                    onSelect={handleSelectDetection}
                />
            )}
        </>
    );
};