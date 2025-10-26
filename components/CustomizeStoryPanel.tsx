
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Story, Detection, StoryStage } from '../types';
import { DETECTIONS_LIBRARY, DETECTIONS_BY_ID } from '../constants';
import { SettingsIcon, KeyActorsIcon, ListBulletIcon } from './icons';
import { Accordion, AccordionItem } from './Accordion';
import { VendorSelectionModal } from './VendorSelectionModal';


interface CustomizeStoryPanelProps {
    addNoise: boolean;
    setAddNoise: (noise: boolean) => void;
    simulationPacing: 'fast' | 'normal' | 'slow';
    setSimulationPacing: (pacing: 'fast' | 'normal' | 'slow') => void;
    selectedStory: Story;
    customEntities: Record<string, string>;
    setCustomEntities: (entities: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
    simulationState: 'running' | 'paused' | 'finished';
    stageDetectionChoices: Record<number, string>;
    setStageDetectionChoices: (choices: Record<number, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
}

export const CustomizeStoryPanel: React.FC<CustomizeStoryPanelProps> = ({
    selectedStory,
    addNoise, setAddNoise,
    simulationPacing, setSimulationPacing,
    customEntities, setCustomEntities,
    simulationState,
    stageDetectionChoices, setStageDetectionChoices
}) => {
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        stage: (StoryStage & { index: number; }) | null;
        availableDetections: Detection[];
    }>({ isOpen: false, stage: null, availableDetections: [] });

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
                ).sort((a, b) => a.productType.localeCompare(b.productType));
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

    const handleEntityChange = (key: string, value: string) => {
        setCustomEntities(prev => ({ ...prev, [key]: value }));
    };

    const handleCommitEdit = () => {
        setEditingKey(null);
    };

    useEffect(() => {
        if (editingKey && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingKey]);

    return (
        <>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full">
                <h2 className="text-xl font-semibold text-white">{selectedStory.name}</h2>
                
                {selectedStory.description && (
                    <p className="text-sm text-gray-400 mt-2">{selectedStory.description}</p>
                )}

                <div className="border-t border-gray-700 my-4"></div>
                
                <div className="flex-grow overflow-y-auto -mr-4 pr-4">
                    <Accordion>
                        <AccordionItem
                            title="Alert Sequence"
                            icon={<ListBulletIcon className="w-5 h-5 text-gray-400" />}
                            defaultOpen={false}
                        >
                            <ol className="relative border-l border-gray-600 ml-2 space-y-4">
                                {alertSequence.map((alert, index) => (
                                    <li key={index} className="ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-green-900/50 text-green-300 border-2 border-green-700 rounded-full -left-3 ring-8 ring-gray-800">
                                            {index + 1}
                                        </span>
                                        <button 
                                            onClick={() => selectedStory.stages && handleStageClick(selectedStory.stages[index], index)}
                                            disabled={simulationState !== 'finished'}
                                            className="w-full text-left p-3 bg-gray-700/60 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:hover:bg-gray-700/60"
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
                        {Array.isArray(selectedStory.actors) && selectedStory.actors.length > 0 && (
                            <AccordionItem
                                title="Key Actors & Entities (Optional)"
                                icon={<KeyActorsIcon className="w-5 h-5 text-gray-400" />}
                                defaultOpen={false}
                            >
                                <p className="text-xs text-gray-400 mb-3 -mt-1">Click on an actor to override its value for this simulation.</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedStory.actors.map(actor => (
                                        <div key={actor}>
                                            {editingKey === actor ? (
                                                <div className="flex items-center gap-1 bg-gray-900/50 rounded-full ring-2 ring-green-500">
                                                    <span className="text-xs font-mono text-gray-400 pl-3 py-1">{actor}:</span>
                                                    <input
                                                        ref={inputRef}
                                                        type="text"
                                                        value={customEntities[actor] || ''}
                                                        onChange={e => handleEntityChange(actor, e.target.value)}
                                                        onBlur={handleCommitEdit}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' || e.key === 'Escape') {
                                                                e.preventDefault();
                                                                handleCommitEdit();
                                                            }
                                                        }}
                                                        className="bg-transparent text-xs font-mono text-white p-1 focus:outline-none w-36"
                                                        placeholder="Enter value..."
                                                    />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingKey(actor)}
                                                    className="text-xs font-mono bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                                                    title={`Click to edit ${actor}`}
                                                >
                                                    <span className="text-gray-400">{actor}:</span> {customEntities[actor] ? <span className="text-white font-semibold">{customEntities[actor]}</span> : <span className="text-gray-500 italic">auto</span>}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </AccordionItem>
                        )}
                        <AccordionItem title="Simulation Settings (Optional)" icon={<SettingsIcon className="w-5 h-5 text-gray-400" />} defaultOpen={false}>
                            <div className="grid grid-cols-1 gap-6 items-start">
                                <div>
                                    <label className="flex items-center">
                                        <input id="add_noise" type="checkbox" checked={addNoise} onChange={e => setAddNoise(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500" />
                                        <span className="ml-2 block text-sm text-gray-300">Add Benign Noise</span>
                                    </label>
                                    <p className="text-xs text-gray-400 mt-1 pl-6">Injects random, non-malicious log events between story stages to simulate real-world traffic.</p>
                                </div>
                                <div>
                                    <label htmlFor="pacing" className="block text-sm font-medium text-gray-300">Simulation Pacing</label>
                                    <select 
                                        id="pacing" 
                                        value={simulationPacing} 
                                        onChange={e => setSimulationPacing(e.target.value as 'fast' | 'normal' | 'slow')}
                                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white text-sm focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="fast">Fast (100-300ms delay)</option>
                                        <option value="normal">Normal (500-1000ms delay)</option>
                                        <option value="slow">Slow (2-5s delay)</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Controls the delay between each log event.</p>
                                </div>
                            </div>
                        </AccordionItem>
                    </Accordion>
                </div>
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