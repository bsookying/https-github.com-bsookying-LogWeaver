

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ATTACK_MATRIX } from '../constants/mitre';
import type { MitreTechnique } from '../constants/mitre';
import { ClipboardListIcon, PlayIcon, SaveIcon, DownloadIcon, GripVerticalIcon, TrashIcon, UploadIcon, PauseIcon, StopIcon, RefreshIcon } from './icons';
import { DETECTIONS_LIBRARY, DOMAINS } from '../constants';
import type { Domain, Story, SelectedTechnique, ImportedStory, LogEntry } from '../types';
import { LiveLogDisplay } from './LiveLogDisplay';

interface StoryBuilderProps {
    onSimulateCustomStory: (storyName: string, storyDescription: string, techniques: SelectedTechnique[]) => void;
    storyToEdit: Story | null;
    onUpdateStory: (storyName: string, storyDescription: string, techniques: SelectedTechnique[]) => void;
    onCancelEdit: () => void;
    onSaveStory: (storyName: string, storyDescription: string, techniques: SelectedTechnique[]) => void;
    onImportStory: (story: ImportedStory) => void;
    simulationState: 'running' | 'paused' | 'finished';
    logs: LogEntry[];
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onNewSession: () => void;
}

interface DetectionInfo {
    productType: string;
    domain: Domain;
    dataSource: string;
}

const DRAFT_KEY = 'logweaver_storyBuilderDraft';

const DetectionSelectionModal: React.FC<{
    state: { technique: MitreTechnique; tacticName: string; options: DetectionInfo[] };
    onSelect: (detection: DetectionInfo) => void;
    onClose: () => void;
}> = ({ state, onSelect, onClose }) => {
    const { technique, tacticName, options } = state;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <ClipboardListIcon className="w-6 h-6 mr-3 text-green-400" />
                            Select Log Source for: <span className="ml-2 text-green-400">{technique.name}</span>
                        </h2>
                        <p className="text-sm text-gray-400 ml-9 mt-1">Tactic: {tacticName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold self-start">&times;</button>
                </div>
                <div className="p-6">
                    <p className="text-gray-300 mb-4 pb-4 border-b border-gray-700">{technique.description}</p>
                    <p className="text-gray-300 mb-4">Multiple log sources are available for this technique. Please choose one to add to your story.</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => onSelect(option)}
                                className="w-full text-left p-4 bg-gray-700 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <p className="font-semibold text-white">{option.productType} - {option.dataSource}</p>
                                <p className="text-sm text-gray-400 mt-1">Domain: {option.domain}</p>
                            </button>
                        ))}
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

export const StoryBuilder: React.FC<StoryBuilderProps> = ({ 
    onSimulateCustomStory, storyToEdit, onUpdateStory, onCancelEdit, onSaveStory, onImportStory, simulationState, logs,
    onPause, onResume, onStop, onNewSession
}) => {
    const [selectedTechniques, setSelectedTechniques] = useState<SelectedTechnique[]>([]);
    const [storyName, setStoryName] = useState('');
    const [storyDescription, setStoryDescription] = useState('');
    const [tacticFilter, setTacticFilter] = useState<string>(() => localStorage.getItem('logweaver_tacticFilter') || '');
    const [productFilter, setProductFilter] = useState<string>(() => localStorage.getItem('logweaver_productFilter') || '');
    const [dataSourceFilter, setDataSourceFilter] = useState<string>(() => localStorage.getItem('logweaver_dataSourceFilter') || '');
    const [selectionModalState, setSelectionModalState] = useState<{
        technique: MitreTechnique;
        tacticName: string;
        options: DetectionInfo[];
    } | null>(null);
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInitialMount = useRef(true);

    const isSimulating = simulationState !== 'finished';

    useEffect(() => { localStorage.setItem('logweaver_tacticFilter', tacticFilter); }, [tacticFilter]);
    useEffect(() => { localStorage.setItem('logweaver_productFilter', productFilter); }, [productFilter]);
    useEffect(() => { localStorage.setItem('logweaver_dataSourceFilter', dataSourceFilter); }, [dataSourceFilter]);

    const detectionsByTechniqueId = useMemo(() => {
        const map = new Map<string, DetectionInfo[]>();
        DETECTIONS_LIBRARY.forEach(d => {
            const techId = d.mitre_technique.split('.')[0];
            const detectionInfo = { productType: d.productType, domain: d.domain, dataSource: d.dataSource };

            const existing = map.get(techId) || [];
            
            if (!existing.some(e => e.productType === detectionInfo.productType && e.dataSource === detectionInfo.dataSource && e.domain === detectionInfo.domain)) {
                existing.push(detectionInfo);
                map.set(techId, existing);
            }
        });
        return map;
    }, []);

    const productsByDomain = useMemo(() => {
        const grouped: Record<string, Set<string>> = {};

        DOMAINS.forEach(domain => {
            grouped[domain] = new Set();
        });

        DETECTIONS_LIBRARY.forEach(detection => {
            if (detection.domain && grouped[detection.domain]) {
                grouped[detection.domain].add(detection.productType);
            }
        });
        
        return DOMAINS.map(domain => ({
            domain,
            products: Array.from(grouped[domain]).sort()
        })).filter(group => group.products.length > 0);
    }, []);
    
    const availableDataSources = useMemo(() => {
        if (!productFilter) return [];
        return [...new Set(DETECTIONS_LIBRARY.filter(d => d.productType === productFilter).map(d => d.dataSource))].sort();
    }, [productFilter]);

    useEffect(() => {
        setDataSourceFilter('');
    }, [productFilter]);

    // This effect handles loading a story for editing OR loading a saved draft from localStorage.
    useEffect(() => {
        if (storyToEdit) {
            setStoryName(storyToEdit.name);
            setStoryDescription(storyToEdit.description || '');
            const techniques: SelectedTechnique[] = (storyToEdit.stages || []).map(stage => {
                let foundTechnique: MitreTechnique | undefined;
                let foundTacticName: string | undefined;

                for (const tactic of ATTACK_MATRIX) {
                    const tech = tactic.techniques.find(t => t.id === stage.techniqueId);
                    if (tech) {
                        foundTechnique = tech;
                        foundTacticName = tactic.name;
                        break;
                    }
                }
                
                const allDetectionInfos = detectionsByTechniqueId.get(stage.techniqueId) || [];
                const detectionForProduct = allDetectionInfos.find(d => d.domain === stage.domain) || allDetectionInfos[0];

                if (foundTechnique && foundTacticName) {
                    return {
                        id: foundTechnique.id,
                        name: foundTechnique.name,
                        tacticName: foundTacticName,
                        domain: stage.domain,
                        productType: detectionForProduct ? detectionForProduct.productType : 'N/A',
                    };
                }
                return null;
            }).filter((t): t is SelectedTechnique => t !== null);
            setSelectedTechniques(techniques);
        } else {
            // Auto-load draft from localStorage on mount if not in edit mode
            try {
                const savedDraft = localStorage.getItem(DRAFT_KEY);
                if (savedDraft) {
                    const { storyName, storyDescription, selectedTechniques } = JSON.parse(savedDraft);
                    setStoryName(storyName || '');
                    setStoryDescription(storyDescription || '');
                    setSelectedTechniques(selectedTechniques || []);
                } else {
                    setStoryName('');
                    setStoryDescription('');
                    setSelectedTechniques([]);
                }
            } catch (e) {
                console.error("Failed to load story builder draft:", e);
                setStoryName('');
                setStoryDescription('');
                setSelectedTechniques([]);
            }
        }
    }, [storyToEdit, detectionsByTechniqueId]);

    // This effect handles auto-saving the current draft to localStorage whenever changes are made.
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        // Do not save a draft if we are in the middle of editing a saved story
        if (storyToEdit) return;

        const hasContent = storyName || storyDescription || selectedTechniques.length > 0;
        if (hasContent) {
            try {
                const draft = { storyName, storyDescription, selectedTechniques };
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            } catch (e) {
                console.error("Failed to save story builder draft:", e);
            }
        } else {
            // Clean up localStorage if the draft is emptied
            localStorage.removeItem(DRAFT_KEY);
        }
    }, [storyName, storyDescription, selectedTechniques, storyToEdit]);
    
    const isSelected = (techniqueId: string) => selectedTechniques.some(t => t.id === techniqueId);

    const handleRemoveTechnique = (index: number) => {
        if (window.confirm('Are you sure you want to remove this stage?')) {
            setSelectedTechniques(prev => prev.filter((_, i) => i !== index));
        }
    };

    const addTechniqueToStory = (technique: MitreTechnique, tacticName: string, detectionInfo: DetectionInfo) => {
        const newTechnique: SelectedTechnique = {
            id: technique.id,
            name: technique.name,
            tacticName,
            domain: detectionInfo.domain,
            productType: detectionInfo.productType,
        };
        setSelectedTechniques(prev => [...prev, newTechnique]);
    };

    const handleTechniqueClick = (technique: MitreTechnique, tacticName: string) => {
        if (isSelected(technique.id)) return;

        const allDetectionInfos = detectionsByTechniqueId.get(technique.id);
        if (!allDetectionInfos || allDetectionInfos.length === 0) return;

        const applicableDetections = allDetectionInfos.filter(d =>
            (!productFilter || d.productType === productFilter) &&
            (!dataSourceFilter || d.dataSource === dataSourceFilter)
        );

        if (applicableDetections.length === 0) {
            console.warn(`No applicable detections for ${technique.id} with current filters.`);
            return;
        }

        if (applicableDetections.length === 1) {
            addTechniqueToStory(technique, tacticName, applicableDetections[0]);
        } else {
            setSelectionModalState({ technique, tacticName, options: applicableDetections });
        }
    };
    
    const handleDetectionSelection = (detectionInfo: DetectionInfo) => {
        if (selectionModalState) {
            addTechniqueToStory(selectionModalState.technique, selectionModalState.tacticName, detectionInfo);
            setSelectionModalState(null);
        }
    };

    const handleExport = () => {
        if (selectedTechniques.length === 0) {
            alert("Please add techniques to the story before exporting.");
            return;
        }

        const storyData: ImportedStory = {
            name: storyName || "Custom Story",
            description: storyDescription,
            stages: selectedTechniques.map(tech => ({
                techniqueId: tech.id,
                techniqueName: tech.name,
                tactic: tech.tacticName,
                domain: tech.domain,
            })),
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(storyData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const fileName = (storyName || 'custom_story').replace(/\s+/g, '_').toLowerCase();
        link.download = `${fileName}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not readable text.");
                
                const data = JSON.parse(text) as ImportedStory;

                // Pass up to App component for full validation and state update
                onImportStory(data);

                // Clear draft after initiating an import
                localStorage.removeItem(DRAFT_KEY);

            } catch (error: any) {
                console.error("Failed to import story:", error);
                alert(`Error importing story: ${error.message}`);
            } finally {
                // Reset file input to allow importing the same file again
                if (event.target) event.target.value = '';
            }
        };
        reader.onerror = () => {
             alert('Error reading file.');
             if (event.target) event.target.value = '';
        }
        reader.readAsText(file);
    };

    const handleSave = () => {
        onSaveStory(storyName, storyDescription, selectedTechniques);
        setStoryName('');
        setStoryDescription('');
        setSelectedTechniques([]);
        localStorage.removeItem(DRAFT_KEY);
    };

    const handleUpdate = () => {
        onUpdateStory(storyName, storyDescription, selectedTechniques);
        localStorage.removeItem(DRAFT_KEY);
    };
    
    const handleResetDraft = () => {
        if (window.confirm('Are you sure you want to clear the current story draft? This cannot be undone.')) {
            setStoryName('');
            setStoryDescription('');
            setSelectedTechniques([]);
            localStorage.removeItem(DRAFT_KEY);
        }
    };
    
    const handleMouseEnter = (e: React.MouseEvent, tech: MitreTechnique) => {
        const detectionInfos = detectionsByTechniqueId.get(tech.id) || [];
        const content = `${tech.name} (${tech.id})\n\n${tech.description}\n\nAvailable Detections:\n${detectionInfos.length > 0 ? detectionInfos.map(d => `• ${d.productType} (${d.dataSource})`).join('\n') : 'None'}`;
        setTooltip({ content, x: e.clientX, y: e.clientY });
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (tooltip) {
            setTooltip(prev => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
        }
    };
    const handleMouseLeave = () => {
        setTooltip(null);
    };
    
    const handleDragStart = (index: number) => {
        dragItem.current = index;
    };
    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
    };
    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const techniquesCopy = [...selectedTechniques];
            const draggedItemContent = techniquesCopy.splice(dragItem.current, 1)[0];
            techniquesCopy.splice(dragOverItem.current, 0, draggedItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
            setSelectedTechniques(techniquesCopy);
        }
    };

    return (
        <div className="mt-6 flex flex-col gap-8">
            {selectionModalState && (
                <DetectionSelectionModal
                    state={selectionModalState}
                    onSelect={handleDetectionSelection}
                    onClose={() => setSelectionModalState(null)}
                />
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />
            {!isSimulating && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-white">MITRE ATT&CK Matrix</h3>
                        <div className="flex items-end gap-4">
                            <div>
                                <label htmlFor="tactic-filter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Tactic</label>
                                <select 
                                    id="tactic-filter" 
                                    value={tacticFilter} 
                                    onChange={e => setTacticFilter(e.target.value)} 
                                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-green-500 focus:border-green-500 text-sm"
                                >
                                    <option value="">All Tactics</option>
                                    {ATTACK_MATRIX.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="product-filter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Product</label>
                                 <select 
                                    id="product-filter" 
                                    value={productFilter} 
                                    onChange={e => setProductFilter(e.target.value)} 
                                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-green-500 focus:border-green-500 text-sm"
                                >
                                    <option value="">All Products</option>
                                    {productsByDomain.map(group => (
                                        <optgroup key={group.domain} label={group.domain}>
                                            {group.products.map(product => (
                                                <option key={product} value={product}>{product}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dataSource-filter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Data Source</label>
                                 <select 
                                    id="dataSource-filter" 
                                    value={dataSourceFilter} 
                                    onChange={e => setDataSourceFilter(e.target.value)} 
                                    disabled={!productFilter}
                                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-green-500 focus:border-green-500 text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"
                                >
                                    <option value="">All Data Sources</option>
                                    {availableDataSources.map(ds => <option key={ds} value={ds}>{ds}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-400 mb-6">Click a technique to add it to your story. If multiple log sources are available, you will be prompted to select one.</p>
                    <div className="flex flex-row gap-2 overflow-x-auto pb-4">
                        {ATTACK_MATRIX.filter(t => !tacticFilter || t.name === tacticFilter).map(tactic => {
                            const hasVisibleTechniques = tactic.techniques.some(tech => {
                               const detectionInfos = detectionsByTechniqueId.get(tech.id);
                               if (!detectionInfos) return false;
                               const productMatch = !productFilter || detectionInfos.some(d => d.productType === productFilter);
                               const dataSourceMatch = !dataSourceFilter || detectionInfos.some(d => d.dataSource === dataSourceFilter);
                               return productMatch && dataSourceMatch;
                            });

                            if (!hasVisibleTechniques && (productFilter || dataSourceFilter)) return null;
                            
                            return (
                                <div key={tactic.id} className="flex-shrink-0 w-48">
                                    <div className="bg-gray-700 p-2 text-center font-bold text-sm rounded-t-md text-white select-none sticky top-0 z-10">{tactic.name}</div>
                                    <div className="flex flex-col gap-1 p-1 bg-gray-900/50 rounded-b-md">
                                        {tactic.techniques.map(tech => {
                                            const detectionInfos = detectionsByTechniqueId.get(tech.id);
                                            const isAvailable = !!detectionInfos && detectionInfos.length > 0;
                                            
                                            if (!isAvailable) {
                                                return (
                                                    <div 
                                                        key={tech.id} 
                                                        className='bg-gray-800/50 text-gray-500 cursor-not-allowed border-transparent p-2 text-xs rounded border'
                                                        onMouseEnter={(e) => handleMouseEnter(e, tech)}
                                                        onMouseMove={handleMouseMove}
                                                        onMouseLeave={handleMouseLeave}
                                                    >
                                                        <p className="truncate">{tech.name}</p>
                                                        <p className="text-gray-500">{tech.id}</p>
                                                    </div>
                                                );
                                            }

                                            const productMatch = !productFilter || detectionInfos.some(d => d.productType === productFilter);
                                            const dataSourceMatch = !dataSourceFilter || detectionInfos.some(d => d.dataSource === dataSourceFilter);

                                            if (!productMatch || !dataSourceMatch) {
                                                return null;
                                            }
                                            
                                            return (
                                                <div 
                                                    key={tech.id} 
                                                    onClick={() => handleTechniqueClick(tech, tactic.name)}
                                                    className={`p-2 text-xs rounded transition-colors duration-200 border ${
                                                        isSelected(tech.id) 
                                                        ? 'bg-green-800/80 text-white border-green-600 cursor-default'
                                                        : 'bg-gray-700/60 hover:bg-gray-700 text-gray-300 cursor-pointer border-gray-600'
                                                    }`}
                                                    onMouseEnter={(e) => handleMouseEnter(e, tech)}
                                                    onMouseMove={handleMouseMove}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    <p className="truncate">{tech.name}</p>
                                                    <p className="text-gray-500">{tech.id}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                <div className={`grid ${isSimulating ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-8`}>
                    {!isSimulating && (
                        <div className="space-y-4">
                             <h3 className="text-xl font-semibold text-white flex items-center">
                                <ClipboardListIcon className="w-6 h-6 mr-2 text-green-400" />
                                {storyToEdit ? 'Edit Story' : 'Custom Story'}
                            </h3>
                            <div>
                                <label htmlFor="story-name" className="block text-sm font-medium text-gray-300 mb-1">Story Name</label>
                                <input 
                                    id="story-name"
                                    type="text" 
                                    placeholder="A unique and descriptive name"
                                    value={storyName}
                                    onChange={e => setStoryName(e.target.value)}
                                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="story-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <textarea
                                    id="story-description"
                                    placeholder="Explain the narrative, actors, and objectives of this story."
                                    value={storyDescription}
                                    onChange={e => setStoryDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Story Stages</label>
                                <div className="h-48 overflow-y-auto border border-gray-700 rounded-md p-2 space-y-2 bg-gray-900/50">
                                    {selectedTechniques.length === 0 ? (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-gray-500 text-center text-sm p-4">Select techniques from the matrix to build your story.</p>
                                        </div>
                                    ) : (
                                        <ol className="text-gray-300 space-y-2">
                                            {selectedTechniques.map((tech, index) => (
                                                <li 
                                                    key={tech.id + index} 
                                                    className="p-2 bg-gray-700/50 rounded text-sm flex justify-between items-center group"
                                                    draggable
                                                    onDragStart={() => handleDragStart(index)}
                                                    onDragEnter={() => handleDragEnter(index)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={(e) => e.preventDefault()}
                                                >
                                                    <div className="flex items-center">
                                                         <GripVerticalIcon className="w-5 h-5 mr-2 text-gray-500 cursor-move" />
                                                        <div>
                                                            <p className="font-semibold">{tech.name} <span className="text-gray-400">({tech.id})</span></p>
                                                            <p className="text-xs text-gray-400">{tech.tacticName} | {tech.domain} | {tech.productType}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemoveTechnique(index)}
                                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove stage"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                     <div className="flex flex-col h-full space-y-4">
                        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                           <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {simulationState === 'finished' && (
                                        <>
                                            <button onClick={() => onSimulateCustomStory(storyName, storyDescription, selectedTechniques)} disabled={selectedTechniques.length === 0} className="flex items-center justify-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors">
                                                <PlayIcon className="w-4 h-4 mr-2" /> Start Simulation
                                            </button>
                                            <button onClick={onNewSession} title="New Session" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md shadow-sm transition-colors">
                                                <RefreshIcon className="w-4 h-4 text-gray-200" />
                                            </button>
                                        </>
                                    )}
                                    {(simulationState === 'running' || simulationState === 'paused') && (
                                        <>
                                            {simulationState === 'running' ? (
                                                <button onClick={onPause} className="flex items-center justify-center py-2 px-3 border border-yellow-600 rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-colors">
                                                    <PauseIcon className="w-4 h-4 mr-2" /> Pause
                                                </button>
                                            ) : (
                                                <button onClick={onResume} className="flex items-center justify-center py-2 px-3 border border-green-600 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors">
                                                    <PlayIcon className="w-4 h-4 mr-2" /> Resume
                                                </button>
                                            )}
                                            <button onClick={onStop} className="flex items-center justify-center py-2 px-3 border border-red-600 rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors">
                                                <StopIcon className="w-4 h-4 mr-2" /> Stop
                                            </button>
                                        </>
                                    )}
                                </div>
                                {!isSimulating && (
                                     <div className="flex items-center gap-2 flex-wrap">
                                        {storyToEdit ? (
                                            <>
                                                <button onClick={handleUpdate} disabled={selectedTechniques.length === 0} className="flex items-center justify-center py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                                                    <SaveIcon className="w-4 h-4 mr-2" /> Update Story
                                                </button>
                                                <button onClick={onCancelEdit} className="flex items-center justify-center py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={handleSave} disabled={selectedTechniques.length === 0} className="flex items-center justify-center py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                                                    <SaveIcon className="w-4 h-4 mr-2" /> Save
                                                </button>
                                                 <button onClick={handleImportClick} className="flex items-center justify-center py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                                                    <UploadIcon className="w-4 h-4 mr-2" /> Import
                                                </button>
                                                <button onClick={handleExport} disabled={selectedTechniques.length === 0} className="flex items-center justify-center py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                                                    <DownloadIcon className="w-4 h-4 mr-2" /> Export
                                                </button>
                                                <button onClick={handleResetDraft} title="Reset Draft" className="flex items-center justify-center py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                                                    <TrashIcon className="w-4 h-4 mr-2" /> Reset Draft
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                           </div>
                        </div>
                        <div className="flex-grow">
                           <LiveLogDisplay
                                logs={logs}
                                simulationState={simulationState}
                                isStorySelected={selectedTechniques.length > 0}
                                onPause={onPause}
                                onResume={onResume}
                                onStop={onStop}
                                onStart={() => onSimulateCustomStory(storyName, storyDescription, selectedTechniques)}
                                onNewSession={onNewSession}
                                showControls={false}
                           />
                        </div>
                    </div>
                </div>
            </div>

            {!isSimulating && tooltip && (
                <div 
                    className="fixed bg-gray-900 border border-gray-700 text-white text-xs rounded-md p-2 shadow-lg z-50 max-w-xs whitespace-pre-wrap"
                    style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};